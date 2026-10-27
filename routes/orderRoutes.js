const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * GET /api/orders
 * Get all orders with populated customer and product info - requires authentication
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer_id', 'name email phone')
            .populate('items.product_id', 'name price category');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID - requires authentication
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer_id', 'name email phone')
            .populate('items.product_id', 'name price category');
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * POST /api/orders
 * Create a new order - requires authentication
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { customer_id, items, total_amount, payment_method, status, order_date } = req.body;
        if (!customer_id || !items || !total_amount || !payment_method || !status || !order_date) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const order = new Order({ customer_id, items, total_amount, payment_method, status, order_date });
        await order.save();
        res.status(201).json({ message: 'Order created successfully.', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * PUT /api/orders/:id
 * Update an order - admin only
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.status(200).json({ message: 'Order updated successfully.', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * DELETE /api/orders/:id
 * Delete an order - admin only
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;
