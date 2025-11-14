const supabase = require("../config/supabase");

/**
 * Middleware to verify JWT token from Supabase
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Middleware to check if user has admin role
 */
async function requireAdmin(req, res, next) {
  try {
    const prisma = require("../config/prisma");

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get user profile to check role
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ error: "Failed to verify admin status" });
  }
}

/**
 * Middleware to attach user profile
 */

async function attachProfile(req, res, next) {
  const prisma = require("../config/prisma");
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const profile = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    req.profile = profile;
    next();
  } catch (error) {
    console.error("Profile attachment error:", error);
    return res.status(500).json({ error: "Failed to load user profile" });
  }
}


module.exports = {
  authenticateToken,
  requireAdmin,
  attachProfile,
};
