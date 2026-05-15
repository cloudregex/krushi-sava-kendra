const { Op } = require('sequelize');
const Product = require('../models/Product');
const SaleItem = require('../models/SaleItem');
const PurchaseItem = require('../models/PurchaseItem');
const { logActivity } = require('../helper/logger');

exports.getLatestBatch = async (req, res) => {
    try {
        console.log("🔍 FETCHING BATCH FOR PRODUCT ID:", req.params.id);
        const [lastSale, lastPurchase, product] = await Promise.all([
            SaleItem.findOne({
                where: { productId: req.params.id },
                order: [['createdAt', 'DESC']],
                attributes: ['batchNo', 'expiryDate', 'rate', 'createdAt']
            }),
            PurchaseItem.findOne({
                where: { productId: req.params.id },
                order: [['createdAt', 'DESC']],
                attributes: ['batchNo', 'expiryDate', 'salePrice', 'createdAt']
            }),
            Product.findByPk(req.params.id)
        ]);
        
        let latestBatch = '';
        let latestExpiry = '';
        let latestSaleRate = '';
        
        // 1. Try to get rate from the very latest transaction (Purchase or Sale)
        if (lastSale && lastPurchase) {
            if (new Date(lastSale.createdAt) > new Date(lastPurchase.createdAt)) {
                latestBatch = lastSale.batchNo;
                latestExpiry = lastSale.expiryDate;
                latestSaleRate = lastSale.rate;
            } else {
                latestBatch = lastPurchase.batchNo;
                latestExpiry = lastPurchase.expiryDate;
                latestSaleRate = lastPurchase.salePrice;
            }
        } else if (lastSale) {
            latestBatch = lastSale.batchNo;
            latestExpiry = lastSale.expiryDate;
            latestSaleRate = lastSale.rate;
        } else if (lastPurchase) {
            latestBatch = lastPurchase.batchNo;
            latestExpiry = lastPurchase.expiryDate;
            latestSaleRate = lastPurchase.salePrice;
        }

        // 2. If the latest rate is 0 or empty, search for ANY recent transaction with a non-zero price
        if (!latestSaleRate || parseFloat(latestSaleRate) === 0) {
            const [anyPurchase, anySale] = await Promise.all([
                PurchaseItem.findOne({
                    where: { productId: req.params.id, salePrice: { [Op.gt]: 0 } },
                    order: [['createdAt', 'DESC']],
                    attributes: ['salePrice', 'createdAt']
                }),
                SaleItem.findOne({
                    where: { productId: req.params.id, rate: { [Op.gt]: 0 } },
                    order: [['createdAt', 'DESC']],
                    attributes: ['rate', 'createdAt']
                })
            ]);
            
            if (anyPurchase && anySale) {
                latestSaleRate = new Date(anySale.createdAt) > new Date(anyPurchase.createdAt) ? anySale.rate : anyPurchase.salePrice;
            } else if (anyPurchase) {
                latestSaleRate = anyPurchase.salePrice;
            } else if (anySale) {
                latestSaleRate = anySale.rate;
            }
        }

        // 3. Fallback to Product's default price from multiUnits if still 0
        if ((!latestSaleRate || parseFloat(latestSaleRate) === 0) && product && product.multiUnits && product.multiUnits.length > 0) {
            const unitWithPrice = product.multiUnits.find(u => parseFloat(u.amount) > 0);
            if (unitWithPrice) {
                latestSaleRate = unitWithPrice.amount;
            } else {
                latestSaleRate = product.multiUnits[0].amount;
            }
        }
        
        if (latestExpiry === 'Invalid date') latestExpiry = '';
        if (latestBatch === 'Invalid date') latestBatch = '';

        console.log(`✅ Result for Product ${req.params.id}: Rate=${latestSaleRate}, Batch=${latestBatch}`);

        res.status(200).json({ 
            batchNo: latestBatch || '', 
            expiryDate: latestExpiry || '',
            saleRate: latestSaleRate || ''
        });
    } catch (error) {
        console.error("Batch fetch error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const items = await Product.findAll();
        
        // Enhance items with latest sale rate for faster frontend auto-fetch
        const enhancedItems = await Promise.all(items.map(async (item) => {
            const [lastPurchase, lastSale] = await Promise.all([
                PurchaseItem.findOne({
                    where: { productId: item.id, salePrice: { [Op.gt]: 0 } },
                    order: [['createdAt', 'DESC']],
                    attributes: ['salePrice', 'createdAt']
                }),
                SaleItem.findOne({
                    where: { productId: item.id, rate: { [Op.gt]: 0 } },
                    order: [['createdAt', 'DESC']],
                    attributes: ['rate', 'createdAt']
                })
            ]);

            let rate = 0;
            if (lastPurchase && lastSale) {
                rate = new Date(lastSale.createdAt) > new Date(lastPurchase.createdAt) ? lastSale.rate : lastPurchase.salePrice;
            } else if (lastPurchase) {
                rate = lastPurchase.salePrice;
            } else if (lastSale) {
                rate = lastSale.rate;
            } else if (item.multiUnits && item.multiUnits.length > 0) {
                rate = item.multiUnits[0].amount;
            }

            return {
                ...item.toJSON(),
                saleRate: rate || ''
            };
        }));

        res.status(200).json(enhancedItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const item = await Product.findByPk(req.params.id);
        if (item) {
            res.status(200).json(item);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        console.log("Creating product with data:", req.body);
        const newItem = await Product.create(req.body);

        // Log activity
        await logActivity(req, 'Product', 'CREATE', `Created new product: ${newItem.productName || newItem.name}`);

        res.status(201).json(newItem);
    } catch (error) {
        console.error("Product creation error:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        // Prevent changing unit and unitValue after creation to maintain stock integrity
        const { unit, unitValue, ...updateData } = req.body;

        const [updated] = await Product.update(updateData, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedItem = await Product.findByPk(req.params.id);

            // Log activity
            await logActivity(req, 'Product', 'UPDATE', `Updated product: ${updatedItem.productName || updatedItem.name}`);

            res.status(200).json(updatedItem);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const itemToDelete = await Product.findByPk(req.params.id);
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            // Log activity
            await logActivity(req, 'Product', 'DELETE', `Deleted product: ${itemToDelete?.productName || itemToDelete?.name || req.params.id}`);

            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
