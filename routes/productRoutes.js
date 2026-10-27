const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * GET /api/products
 * Get all products - requires authentication
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * GET /api/products/:id
 * Get a single product by ID - requires authentication
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * POST /api/products
 * Create a new product - admin only
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, price, category, stock } = req.body;
        if (!name || price === undefined || !category || stock === undefined) {
            return res.status(400).json({ message: 'name, price, category and stock are required.' });
        }
        const product = new Product({ name, price, category, stock });
        await product.save();
        res.status(201).json({ message: 'Product created successfully.', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * PUT /api/products/:id
 * Update a product - admin only
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.status(200).json({ message: 'Product updated successfully.', product });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * DELETE /api/products/:id
 * Delete a product - admin only
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        res.status(200).json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;
