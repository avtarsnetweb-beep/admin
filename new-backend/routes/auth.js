
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res) => {

  try {
    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
    });


    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.post('/create-profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, role = 'customer' } = req.body;

    const existingProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    const profile = await prisma.user.create({
      data: {
        id: req.user.id,
        email: req.user.email,
        full_name: fullName, // match DB column naming
        role,
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

module.exports = router;
