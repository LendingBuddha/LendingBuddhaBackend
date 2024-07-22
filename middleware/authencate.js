import jwt from "jsonwebtoken";


const verifyToken = (req, res, next) => {
  // Get token from cookies or Authorization header
  const idToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

  // Check if token is undefined or empty
  if (!idToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify token
    jwt.verify(idToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Unauthorized: Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
      req.user = decoded; // Attach decoded user information to request object
      next(); // Pass control to the next middleware or route handler
    });
  } catch (err) {
    // Handle verification errors
    if (err.name === 'TokenExpiredError') {
      console.error('Token expired:', err);
      return res.status(401).json({ error: 'TokenExpired' });
    } else {
      console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Forbidden' });
    }
  }
};

export default verifyToken;
