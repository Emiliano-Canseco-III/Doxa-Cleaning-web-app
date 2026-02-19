import jwt from "jsonwebtoken";

// Verify the JWT token that it exists and is valid
export const authenticateToken = (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers["authorization"];
  // && Checks if header exists or if it's null. The .split will split the string using a space.
  const token = authHeader && authHeader.split(" ")[1];

  // Checks if user has a token and if it actually exists. If not, stops code and returns error
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user info to request
    req.user = decoded;
    // Continue to the next route handler.
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    // Return 403 forbidden if the user trying to get into admin only area is not an admin
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Check if user is accessing their own data.
export const requireOwnerOrAdmin = (req, res, next) => {
  // Get the user's ID from route parameters
  const requestedUserId = parseInt(req.params.id, 10);

  if (req.user.role === "admin" || req.user.id === requestedUserId) {
    // If the user is an admin or accessing their own data allow access
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Access denied. You can only access your own data." });
  }
};
