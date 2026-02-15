import jwt from "jsonwebtoken";

// Verify JWT token exists and is valid
export const authenticateToken = (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format is "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add user info to request
    next(); // Continue to the route handler.
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" }); // Return 403 forbidden if user is not an admin.
  }
  next(); // Continue to the route handler if user is an admin.
};

// Check if user is accessing their own data.
export const requireOwnerOrAdmin = (req, res, next) => {
  const requestedUserId = parseInt(req.params.id, 10); // Get user ID from route parameters

  if (req.user.role === "admin" || req.user.id === requestedUserId) {
    next(); // User is admin or accessing their own data, allow access.
  } else {
    return res
      .status(403)
      .json({ error: "Access denied. You can only access your own data." });
  }
};
