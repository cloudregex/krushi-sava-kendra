const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { sequelize } = require('../config/db');
const { logActivity } = require('../helper/logger');
const { Op } = require('sequelize');

exports.createQuotation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { 
            quotationNo, customerId, date, validUntil, subtotal, taxAmount, 
            discountAmount, discountType, discountValue, grandTotal, notes, items 
        } = req.body;

        // Auto-resolve duplicate quotationNo to make it extremely bulletproof
        let finalQuotationNo = quotationNo;
        let exists = await Quotation.findOne({ where: { quotationNo: finalQuotationNo }, transaction: t });
        if (exists) {
            const year = new Date(date || new Date()).getFullYear();
            const prefix = `QTN-${year}-`;
            const quotations = await Quotation.findAll({
                where: {
                    quotationNo: {
                        [Op.like]: `${prefix}%`
                    }
                },
                transaction: t
            });

            let maxNo = 0;
            for (const q of quotations) {
                const parts = q.quotationNo.split('-');
                const lastPart = parts[parts.length - 1];
                const num = parseInt(lastPart, 10);
                if (!isNaN(num) && num > maxNo) {
                    maxNo = num;
                }
            }
            let nextNo = maxNo + 1;
            finalQuotationNo = `${prefix}${String(nextNo).padStart(6, '0')}`;
            
            let doubleCheck = await Quotation.findOne({ where: { quotationNo: finalQuotationNo }, transaction: t });
            while (doubleCheck) {
                nextNo++;
                finalQuotationNo = `${prefix}${String(nextNo).padStart(6, '0')}`;
                doubleCheck = await Quotation.findOne({ where: { quotationNo: finalQuotationNo }, transaction: t });
            }
        }

        // 1. Create Quotation
        const quotation = await Quotation.create({
            quotationNo: finalQuotationNo, customerId, date, validUntil: validUntil || null, subtotal, taxAmount,
            discountAmount, discountType, discountValue, grandTotal, status: 'Pending', notes
        }, { transaction: t });

        // 2. Create Quotation Items
        for (const item of items) {
            await QuotationItem.create({
                quotationId: quotation.id,
                productId: item.productId,
                batchNo: item.batchNo,
                expiryDate: item.expiryDate || null,
                quantity: item.quantity,
                freeQuantity: item.freeQuantity || 0,
                unit: item.unit,
                rate: item.rate,
                discount: item.discount,
                taxPercent: item.taxPercent,
                taxAmount: item.taxAmount,
                totalAmount: item.totalAmount
            }, { transaction: t });
        }

        // Note: As this is just a quotation (price quote), we DO NOT deduct stock or update customer balance!
        
        await t.commit();
        
        try {
            if (logActivity) {
                await logActivity(req, 'Quotation', 'CREATE', `Created quotation ID: ${quotation.id}`);
            }
        } catch (le) {
            console.log("Logger error (optional):", le);
        }

        res.status(201).json({ message: 'Quotation created successfully', quotation });
    } catch (error) {
        await t.rollback();
        console.error('Quotation Creation Error:', error);
        res.status(500).json({ message: 'Failed to create quotation', error: error.message });
    }
};

exports.getAllQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.findAll({
            include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'mobile'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quotations', error: error.message });
    }
};

exports.getNextQuotationNo = async (req, res) => {
    try {
        const year = new Date().getFullYear();
        const prefix = `QTN-${year}-`;
        
        const quotations = await Quotation.findAll({
            where: {
                quotationNo: {
                    [Op.like]: `${prefix}%`
                }
            },
            attributes: ['quotationNo']
        });

        let maxNo = 0;
        for (const q of quotations) {
            const parts = q.quotationNo.split('-');
            const lastPart = parts[parts.length - 1];
            const num = parseInt(lastPart, 10);
            if (!isNaN(num) && num > maxNo) {
                maxNo = num;
            }
        }

        let nextNo = maxNo + 1;
        let quotationNo = `${prefix}${String(nextNo).padStart(6, '0')}`;

        let exists = await Quotation.findOne({ where: { quotationNo } });
        while (exists) {
            nextNo++;
            quotationNo = `${prefix}${String(nextNo).padStart(6, '0')}`;
            exists = await Quotation.findOne({ where: { quotationNo } });
        }

        res.json({ quotationNo });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate quotation number', error: error.message });
    }
};

exports.getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findByPk(req.params.id, {
            include: [
                { 
                    model: QuotationItem, 
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Customer, as: 'customer' }
            ]
        });
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.status(200).json(quotation);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quotation details', error: error.message });
    }
};

exports.deleteQuotation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const quotation = await Quotation.findByPk(id, { transaction: t });
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        await QuotationItem.destroy({ where: { quotationId: id }, transaction: t });
        await quotation.destroy({ transaction: t });
        
        await t.commit();
        
        try {
            if (logActivity) {
                await logActivity(req, 'Quotation', 'DELETE', `Deleted quotation ID: ${id}`);
            }
        } catch (le) {}

        res.status(200).json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Failed to delete quotation', error: error.message });
    }
};

exports.updateQuotation = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const quotation = await Quotation.findByPk(id, { transaction: t });
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        // 1. Delete old quotation items
        await QuotationItem.destroy({ where: { quotationId: id }, transaction: t });

        // 2. Apply new quotation data
        const {
            customerId, date, validUntil, subtotal, taxAmount, discountAmount,
            discountType, discountValue, grandTotal, notes, items
        } = req.body;

        await quotation.update({
            customerId, date, validUntil: validUntil || null, subtotal, taxAmount, discountAmount,
            discountType, discountValue, grandTotal, notes
        }, { transaction: t });

        // 3. Create new quotation items
        for (const item of items) {
            await QuotationItem.create({
                quotationId: quotation.id,
                productId: item.productId,
                batchNo: item.batchNo,
                expiryDate: item.expiryDate || null,
                quantity: item.quantity,
                freeQuantity: item.freeQuantity || 0,
                unit: item.unit,
                rate: item.rate,
                discount: item.discount,
                taxPercent: item.taxPercent,
                taxAmount: item.taxAmount,
                totalAmount: item.totalAmount
            }, { transaction: t });
        }

        await t.commit();
        
        try {
            if (logActivity) {
                await logActivity(req, 'Quotation', 'UPDATE', `Updated quotation ID: ${id}`);
            }
        } catch (le) {}

        res.status(200).json({ message: 'Quotation updated successfully', quotation });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Failed to update quotation', error: error.message });
    }
};

// PATCH /:id/accept — Bill मध्ये Convert झाल्यावर status 'Accepted' करतो
exports.acceptQuotation = async (req, res) => {
    try {
        const { id } = req.params;
        const quotation = await Quotation.findByPk(id);
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        await quotation.update({ status: 'Accepted' });

        try {
            if (logActivity) {
                await logActivity(req, 'Quotation', 'ACCEPT', `Quotation ID: ${id} converted to Bill`);
            }
        } catch (le) {}

        res.status(200).json({ message: 'Quotation accepted successfully', quotation });
    } catch (error) {
        console.error('Accept Quotation Error:', error);
        res.status(500).json({ message: 'Failed to accept quotation', error: error.message });
    }
};

