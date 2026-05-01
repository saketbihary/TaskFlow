/**
 * User Routes
 * GET  /api/users          - Get all users (ADMIN only)
 * GET  /api/users/:id      - Get single user
 * PUT  /api/users/:id      - Update user (ADMIN or self)
 * DELETE /api/users/:id    - Delete user (ADMIN only)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 */
router.get('/', restrictTo('ADMIN'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin or self)
 */
router.put('/:id', async (req, res) => {
  try {
    // Only admin or the user themselves can update
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, role } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    // Only admin can change roles
    if (role && req.user.role === 'ADMIN') updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 */
router.delete('/:id', restrictTo('ADMIN'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

module.exports = router;
