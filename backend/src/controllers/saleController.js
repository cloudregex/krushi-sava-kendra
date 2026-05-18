const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { sequelize } = require('../config/db');

exports.createSale = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            invoiceNo, customerId, billDate, subtotal, taxAmount, 
            discountAmount, discountType, discountValue, grandTotal, paidAmount, balanceAmount, 
            paymentMode, notes, items 
        } = req.body;

        // 1. Create Sale
        const sale = await Sale.create({
            invoiceNo, customerId, billDate, subtotal, taxAmount,
            discountAmount, discountType, discountValue, grandTotal, paidAmount, balanceAmount,
            paymentMode, notes
        }, { transaction: t });

        // 2. Create Sale Items & Update Stock
        for (const item of items) {
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                batchNo: item.batchNo,
                expiryDate: item.expiryDate,
                quantity: item.quantity,
                freeQuantity: item.freeQuantity,
                unit: item.unit,
                rate: item.rate,
                discount: item.discount,
                taxPercent: item.taxPercent,
                taxAmount: item.taxAmount,
                totalAmount: item.totalAmount
            }, { transaction: t });

            // Deduct stock and update customer balance
            const product = await Product.findByPk(item.productId);
            if (product) {
                const qty = parseFloat(item.quantity) || 0;
                const freeQty = parseFloat(item.freeQuantity) || 0;
                const factor = parseFloat(item.conversionFactor) || 1;
                const stockInc = parseFloat(item.stockIncrement) || 0;

                // Qty and FreeQty are in selected units, convert to primary for deduction
                // Assuming: PrimaryQty = SelectedQty / Factor (e.g., 500g / 1000 = 0.5kg)
                const totalDeduction = (qty + freeQty) / factor;
                
                product.currentStock = (parseFloat(product.currentStock) || 0) - totalDeduction + stockInc;
                await product.save({ transaction: t });
            }
        }

        // 3. Update Customer Balance
        const customer = await Customer.findByPk(customerId, { transaction: t });
        if (customer) {
            // balanceAmount is (grandTotal - paidAmount)
            // If positive, it increases the pending balance.
            customer.balance = (parseFloat(customer.balance) || 0) + parseFloat(balanceAmount);
            await customer.save({ transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'Sale completed successfully', sale });
    } catch (error) {
        await t.rollback();
        console.error('Sale Creation Error:', error);
        res.status(500).json({ message: 'Failed to complete sale', error: error.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({
            include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'mobile'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sales', error: error.message });
    }
};

exports.getNextInvoiceNo = async (req, res) => {
    try {
        const lastSale = await Sale.findOne({
            order: [['id', 'DESC']]
        });
        
        let nextNo = 1;
        if (lastSale && lastSale.invoiceNo) {
            const lastNo = parseInt(lastSale.invoiceNo.split('-').pop());
            if (!isNaN(lastNo)) {
                nextNo = lastNo + 1;
            }
        }
        
        const year = new Date().getFullYear();
        const invoiceNo = `SALE-${year}-${String(nextNo).padStart(6, '0')}`;
        res.json({ invoiceNo });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate invoice number', error: error.message });
    }
};

exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                { 
                    model: SaleItem, 
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Customer, as: 'customer' }
            ]
        });
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        console.error('Fetch Sale Error:', error);
        res.status(500).json({ message: 'Failed to fetch sale details', error: error.message });
    }
};

exports.updateSale = async (req, res) => {
    const t = await Sale.sequelize.transaction();
    try {
        const saleId = req.params.id;
        const sale = await Sale.findByPk(saleId, { include: [{ model: SaleItem, as: 'items' }] });
        if (!sale) {
            await t.rollback();
            return res.status(404).json({ message: 'Sale not found' });
        }

        // 1. Revert Old Sale Data
        for (const item of sale.items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                product.stock += (parseFloat(item.quantity) + parseFloat(item.freeQuantity || 0));
                await product.save({ transaction: t });
            }
        }
        if (sale.customerId) {
            const customer = await Customer.findByPk(sale.customerId, { transaction: t });
            if (customer) {
                customer.balance -= parseFloat(sale.balanceAmount);
                await customer.save({ transaction: t });
            }
        }
        await SaleItem.destroy({ where: { saleId }, transaction: t });

        // 2. Apply New Sale Data
        const {
            customerId, billDate, subtotal, taxAmount, discountAmount,
            discountType, discountValue, grandTotal, paidAmount, balanceAmount, paymentMode, notes, items
        } = req.body;

        await sale.update({
            customerId, billDate, subtotal, taxAmount, discountAmount,
            discountType, discountValue, grandTotal, paidAmount, balanceAmount, paymentMode, notes
        }, { transaction: t });

        for (const item of items) {
            await SaleItem.create({
                saleId: sale.id,
                productId: item.productId,
                batchNo: item.batchNo,
                expiryDate: item.expiryDate,
                quantity: item.quantity,
                freeQuantity: item.freeQuantity,
                unit: item.unit,
                rate: item.rate,
                discount: item.discount,
                taxPercent: item.taxPercent,
                taxAmount: item.taxAmount,
                totalAmount: item.totalAmount
            }, { transaction: t });

            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                product.stock -= (parseFloat(item.quantity) + parseFloat(item.freeQuantity || 0));
                await product.save({ transaction: t });
            }
        }

        if (customerId) {
            const customer = await Customer.findByPk(customerId, { transaction: t });
            if (customer) {
                customer.balance += parseFloat(balanceAmount);
                await customer.save({ transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Sale updated successfully', sale });
    } catch (error) {
        await t.rollback();
        console.error('Update Sale Error:', error);
        res.status(500).json({ message: 'Failed to update sale', error: error.message });
    }
};

exports.deleteSale = async (req, res) => {
    const t = await Sale.sequelize.transaction();
    try {
        const saleId = req.params.id;
        const sale = await Sale.findByPk(saleId, { include: [{ model: SaleItem, as: 'items' }] });
        if (!sale) {
            await t.rollback();
            return res.status(404).json({ message: 'Sale not found' });
        }

        // Revert stock
        for (const item of sale.items) {
            const product = await Product.findByPk(item.productId, { transaction: t });
            if (product) {
                product.stock += (parseFloat(item.quantity) + parseFloat(item.freeQuantity || 0));
                await product.save({ transaction: t });
            }
        }

        // Revert customer balance
        if (sale.customerId) {
            const customer = await Customer.findByPk(sale.customerId, { transaction: t });
            if (customer) {
                customer.balance -= parseFloat(sale.balanceAmount);
                await customer.save({ transaction: t });
            }
        }

        await SaleItem.destroy({ where: { saleId }, transaction: t });
        await sale.destroy({ transaction: t });
        
        await t.commit();
        res.json({ message: 'Sale deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Delete Sale Error:', error);
        res.status(500).json({ message: 'Failed to delete sale', error: error.message });
    }
};
