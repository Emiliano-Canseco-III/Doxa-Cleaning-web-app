import jwt from "jsonwebtoken";

// Check JWT existence and validate
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Add user info to request
    req.user = decoded;
    console.log("Decoded token:", decoded);
    next();

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Check users role is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Check user is accessing their own data.
export const requireOwnerOrAdmin = (req, res, next) => {
  const requestedId = parseInt(req.params.id || req.query.employee_id, 10);

  if (req.user.role === "admin" || req.user.userId === requestedId) {
    next();
  } else {
    return res.status(403).json({ error: "Access denied." });
  }
};
