const jwt = require("jsonwebtoken");

// Middleware 1: verify JWT and attach user to req
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  // Expected format: "Bearer <token>"
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Middleware 2: allow only specific roles (e.g. admin)
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient role." });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
