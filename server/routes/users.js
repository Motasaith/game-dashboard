const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Search Users
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).select('-password').limit(5);

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Profile
router.put('/update', auth, async (req, res) => {
    const { username } = req.body;
    try {
        // Check if username is taken
        if (username) {
            let user = await User.findOne({ username });
            if (user && user.id !== req.user.id) {
                return res.status(400).json({ msg: 'Username already taken' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { username } },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
