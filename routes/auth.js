const User = require('../models/User');
const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
        const hashedPass = await bcrypt.hash(password, 10);
        const user = await User.create({ username: username, password: hashedPass });
        res.status(201).json({ message: 'User registered successfully', username: user.username });
    }
    catch (e) {
        console.error(e);
        if (e.code === 11000) return res.status(409).json({ message: 'Username already taken, try another one!!' });
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Required username and password' });

        const user = await User.findOne({ username: username });
        if (!user) return res.status(404).json({ message: 'Incorrect username !! ' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect password or username' });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.status(200).json({ token });
    }
    catch (e) {
        res.status(500).json({ message: 'Invalid Id format' });
    }

});

module.exports = router;