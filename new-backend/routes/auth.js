
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const supabase = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * GET /auth/profile - Get or create user profile
 * This endpoint handles both regular and OAuth users
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Try to find existing profile
    let profile = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // If no profile exists (OAuth user signing in for first time), create one
    if (!profile) {
      console.log('Creating new profile for OAuth user:', req.user.email);
      
      profile = await prisma.user.create({
        data: {
          id: req.user.id,
          email: req.user.email,
          full_name: req.user.user_metadata?.full_name || req.user.user_metadata?.name || null,
          role: 'customer', // Default role
        },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * POST /auth/create-profile - Create user profile (for email/password signup)
 */
router.post('/create-profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, role = 'customer' } = req.body;

    // Check if profile already exists
    const existingProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Create new profile
    const profile = await prisma.user.create({
      data: {
        id: req.user.id,
        email: req.user.email,
        full_name: fullName,
        role,
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

/**
 * POST /auth/forgot-password - Send OTP for password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email not found!" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in DB with expiry (10 minutes)
    await prisma.user.update({
      where: { email },
      data: { 
        resetOtp: otp,
        resetOtpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    // TODO: Send email via nodemailer
    console.log("OTP for dev:", otp);

    res.json({ 
      message: "OTP sent to email!", 
      otp // Remove this in production!
    });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: "Error sending OTP" });
  }
});

/**
 * POST /auth/reset-password - Reset password with OTP
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Check if OTP matches and hasn't expired
    if (user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.resetOtpExpiry && new Date() > user.resetOtpExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Hash password for Prisma DB
    const hashedPwd = await bcrypt.hash(newPassword, 10);

    // Update Prisma table
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPwd,
        resetOtp: null,
        resetOtpExpiry: null
      }
    });

    // Update Supabase Auth password
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (error) {
      console.error('Supabase password update error:', error);
      return res.status(500).json({ error: "Failed to update Supabase password" });
    }

    res.json({ message: "Password reset successful!" });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

module.exports = router;