import jwt from "jsonwebtoken"
// This Method for Firebase Token Authnetication


// import { auth } from "../config/firebase-config.js";

// const authenticate = async (req, res, next) => {
//     const idToken = req.headers.authorization?.split('Bearer ')[1];
  
//     if (!idToken) {
//       return res.status(401).send('Unauthorized');
//     }
  
//     try {
//       const decodedToken = await admin.auth().verifyIdToken(idToken);
//       req.user = decodedToken;
//       next();
//     } catch (error) {
//       return res.status(401).send('Unauthorized');
//     }
//   };

//   export default authenticate

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    // Get token from cookies or Authorization header
    const idToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
    // Check if token is undefined or empty
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      // Verify token
      const decoded = jwt.verify(idToken, process.env.JWT_SECRET_KEY);
      console.log(decoded);
      req.user = decoded;
      next(); 
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
  
  export default verifyToken