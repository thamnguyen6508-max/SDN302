const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * GET /api/customers
 * Get all customers - requires authentication
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * GET /api/customers/:id
 * Get a single customer by ID - requires authentication
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * POST /api/customers
 * Create a new customer - admin only
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        if (!name || !phone || !email || !address) {
            return res.status(400).json({ message: 'name, phone, email and address are required.' });
        }
        const customer = new Customer({ name, phone, email, address });
        await customer.save();
        res.status(201).json({ message: 'Customer created successfully.', customer });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * PUT /api/customers/:id
 * Update a customer - admin only
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!customer) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json({ message: 'Customer updated successfully.', customer });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

/**
 * DELETE /api/customers/:id
 * Delete a customer - admin only
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found.' });
        res.status(200).json({ message: 'Customer deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

module.exports = router;
