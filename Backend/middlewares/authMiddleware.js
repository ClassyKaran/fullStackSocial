const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log(process.env.JWT_SECRET); // Check if JWT_SECRET is defined
    console.log("Decoded token:", decoded); // Log decoded token to verify it's correct

    // Support both 'id' and 'userId' in token payload
    const userId = decoded.id || decoded.userId;
    // Validate ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user id in token' });
    }
    req.user = await User.findById(userId);
    console.log("userfrommiddleware", req.user);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
