import { Lender } from "../models/Lender.js";
import { Borrower } from "../models/Borrower.js";
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
      let user;
      const decoded = jwt.verify(idToken, process.env.JWT_SECRET_KEY);
      //verify  roles
      if(decoded.type === 'lender'){
          user=await Lender.findById(decoded.uid);
      }else if(decoded.type === 'borrower'){
          user=await Borrower.findById(decoded.uid);
      }
      if(!user) return res.status(401).json({error : "Access denied . Invalid Tokens"})
      
      req.user = user;
      req.type=decoded.type;

      next(); 
    } catch (err) {
      // Handle verification errors
      console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
   

  const authorizeRoles= (allowedTypes)=>{
     
     return (req,res,next)=>{
       
      if(!allowedTypes.includes(req.type)){
            
           return res.status(403).json ({error : 'Access denied . You do not have required permissions'})
      }
      next();
     }
    
      
  }







  module.exports={ verifyToken ,authorizeRoles}