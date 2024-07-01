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
    let idToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
    // Check if token is undefined or empty
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      // Verify token
      const decoded = await jwt.verify(idToken, JWT_SECRET_KEY);
      req.user = decoded;
      next(); 
    } catch (err) {
      // Handle verification errors
      console.error('Error verifying token:', err);
      return res.status(403).json({ error: 'Forbidden' });
    }
  };
   
  //verify isLender 

  const isLender=async (req,res,next)=>{
    try {
       const lender=await Lender.findById(req.user.uid)
       if(!lender){
          return res.status(404).json({error : "Lender Not Found"})
       }

       if(lender.role != 'lender'){
        return res.status(403).json({error : "Forbiden Lender Not Found"})
       }
       req.lender=lender;
       next();
    } catch (error) {
      return res.status(500).json({ error: 'Server Error' });
    }
}

// verify is borrower

const isBorrower=async (req,res,next)=>{
  try {
     const borrower=await Borrower.findById(req.user.uid)
     if(!borrower){
        return res.status(404).json({error : "Borrower Not Found"})
     }

     if(borrower.role != 'borrower'){
      return res.status(403).json({error : "Forbiden Borrower Not Found"})
     }
     req.borrower=borrower;
     next();
  } catch (error) {
    return res.status(500).json({ error: 'Server Error' });
  }
}



  module.exports={ verifyToken , isLender,isBorrower}