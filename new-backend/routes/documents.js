const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");
const { authenticateToken, attachProfile } = require("../middleware/auth");
const upload = require("../middleware/upload");

/**
 * POST /documents/upload - Upload a document
 */
router.post(
  "/upload",
  authenticateToken,
  attachProfile,
  upload.single("document"),
  async (req, res) => {
    console.log("file", req.body);

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Upload to Cloudinary
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "auth-documents",
            resource_type: "raw",
            public_id: `${req.user.id}_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      const cloudinaryResult = await uploadPromise;

      // Save document metadata to database
      const document = await prisma.document.create({
        data: {
          userId: req.user.id,
          fileUrl: cloudinaryResult.secure_url,
          cloudinaryId: cloudinaryResult.public_id,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: BigInt(req.file.size),
          status: "pending",
        },
      });

      // Convert BigInt to string for JSON serialization
      const documentResponse = {
        ...document,
        fileSize: document.fileSize.toString(),
      };

      res.status(201).json({
        message: "Document uploaded successfully",
        document: documentResponse,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  }
);

/**
 * GET /documents/my-documents - Get current user's documents
 */
router.get("/my-documents", authenticateToken, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.id },
      orderBy: { uploadedAt: "desc" },
    });

    // Convert BigInt to string for JSON serialization
    const documentsResponse = documents.map((doc) => ({
      ...doc,
      fileSize: doc.fileSize ? doc.fileSize.toString() : null,
    }));

    res.json(documentsResponse);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

/**
 * DELETE /documents/:id - Delete a document
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find document and verify ownership
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // FIX: Ensure both IDs are strings for comparison
    const documentUserId = String(document.userId);
    const requestUserId = String(req.user.id);

    if (documentUserId !== requestUserId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this document" });
    }

    // Delete from Cloudinary using stored public_id
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId, {
          resource_type: "auto",
        });
        console.log("✅ Deleted from Cloudinary");
      } catch (cloudinaryError) {
        console.warn("⚠️ Cloudinary delete failed:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    } else {
      console.warn("⚠️ No cloudinaryId found, skipping Cloudinary delete");
    }

    console.log("🗑️ Deleting from database...");

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    console.log("✅ Document deleted successfully");

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete document error:", error);

    // Better error handling
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(500).json({
      error: "Failed to delete document",
      details: error.message,
    });
  }
});

module.exports = router;
