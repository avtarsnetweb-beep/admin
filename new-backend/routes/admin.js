const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /admin/documents - Get all documents (admin only)
 */
router.get('/documents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            role: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    // Convert BigInt to string for JSON serialization
    const documentsResponse = documents.map(doc => ({
      ...doc,
      fileSize: doc.fileSize ? doc.fileSize.toString() : null
    }));

    res.json(documentsResponse);
  } catch (error) {
    console.error('Admin get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

/**
 * PATCH /admin/documents/:id/status - Update document status (admin only)
 */
router.patch('/documents/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const document = await prisma.document.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'Document status updated successfully',
      document: {
        ...document,
        fileSize: document.fileSize ? document.fileSize.toString() : null
      }
    });
  } catch (error) {
    console.error('Update document status error:', error);
    res.status(500).json({ error: 'Failed to update document status' });
  }
});

/**
 * GET /admin/users - Get all users (admin only)
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.profile.findMany({
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
