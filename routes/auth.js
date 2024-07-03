import { Router } from "express";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "../config/firebase-config.js";
import { Lender } from "../models/Lender.js";
import { Borrower } from "../models/Borrower.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";
import ImageKit from "imagekit";
import { promises as fsPromises } from "fs";
import {verifyToken,authorizeRoles} from "../middleware/authencate.js";

import dotenv from 'dotenv';
import { upload } from "../middleware/multer.js";
dotenv.config();

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

async function uploadImage(filePath) {
  try {
    if (!filePath) return "Could Not find the path ";
    const data = await fsPromises.readFile(filePath);
    let base64data = Buffer.from(data).toString("base64");

    const result = await imagekit.upload({
      file: base64data,
      fileName: "Image",
    });
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    console.log({ message: error.message });
  }
}

const router = Router();

const jwtsecret = process.env.JWT_SECRET_KEY;

const generateJWT = (uid, type, time) => {
  return jwt.sign({ uid: uid, type: type }, jwtsecret, { expiresIn: `${time}` });
};

//POST - Register new user
router.post("/signup/lender", upload.single("profilePic"),async (req, res) => {
  const {
    fullname,
    email,
    password,
    dob,
    pancard,
    aadharcard,
    phonenumber,
    profilePic,
  } = req.body;
  try {
    const LenderUser = await Lender.findOne({ email });

    if (LenderUser) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const result = await uploadImage(profilePic);
    const hashPan = await bcrypt.hash(pancard, 10);
    const hashAadhar = await bcrypt.hash(aadharcard, 10);

    // console.log("PanCard \t ", hashPan);
    // console.log("Aadhar \t ", hashAadhar);

    const Lenderuser = await Lender.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: hashPan,
      aadharCard: hashAadhar,
      uid: user.uid,
      profilePic: result.url,
    });

    const createdUser = await Lender.findById(Lenderuser._id).select(
      "-panCard -aadharCard "
    );
    if (!createdUser) {
      return res.status(500).send("Internal Error!!!");
    }
    res.status(201).json({
      message: "Lender User created",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
router.post("/signup/borrower", upload.single("profilePic"),async (req, res) => {
  const { fullname, email, password, dob, pancard, aadharcard, phonenumber, profilePic } =
    req.body;
  try {

    const BorrowerUser = await Borrower.findOne({ email });
    if (BorrowerUser) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const result = await uploadImage(profilePic);
    const hashPan = await bcrypt.hash(pancard, 10);
    const hashAadhar = await bcrypt.hash(aadharcard, 10);

    // console.log("PanCard \t ", hashPan);
    // console.log("Aadhar \t ", hashAadhar);

    const borrowerUser = await Borrower.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: hashPan,
      aadharCard: hashAadhar,
      aadharCard: hashAadhar,
      uid: user.uid,
      profilePic: result.url
    });

    const createdUser = await Borrower.findById(borrowerUser._id).select(
      "-panCard -aadharCard "
    );
    if (!createdUser) {
      return res.status(500).send("Internal Error!!!");
    }

    res.status(201).json({
      message: "Borrower User created",
      data: createdUser,
    });
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(500).send({ error: errorMessage });
  }
});

// POST- Login user
router.post("/login/lender", async (req, res) => {
  const { email, password } = req.body;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      const accessToken = generateJWT(user.uid, "lender", "30m")

      const refreshToken = generateJWT(user.uid, "lender", "30d")

      // Set refresh token in an HTTP-only and secure cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        // sameSite: "strict",
      });

      res.setHeader("Authorization", `Bearer ${accessToken}`);

      // Send response indicating successful login
      res.status(200).json({ message: "User logged in successfully", user });
    })
    .catch((error) => {
      const errorMessage = error.message;
      res.status(500).send(errorMessage);
    });
});

router.post("/login/borrower", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // console.log(user);
      // ...
      const accessToken = generateJWT(user.uid, "borrower", "30m")

      const refreshToken = generateJWT(user.uid, "borrower", "30d")
      // Set refresh token in an HTTP-only and secure cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        // sameSite: "strict",
      });

      res.setHeader("Authorization", `Bearer ${accessToken}`);

      // Send response indicating successful login
      res.status(200).json({ message: "User logged in successfully", user });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(500).send(errorMessage);
    });
});


// GET - HOME_ROUTE
router.route("/lenderhome").get(verifyToken,authorizeRoles(['lender']), async (req, res) => {
  try {
    return res.status(200).json({
      message: "Welcome to Protected Route of Lender Home",
      data: req.user.uid,
    });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
});
router.route("/borrowerhome").get(verifyToken,authorizeRoles(['borrower']), async (req, res) => {
  try {
    return res.status(200).json({
      message: "Welcome to Protected Route of Borrower Home",
      data: req.user.uid,
    });
  } catch (e) {
    console.log(e);
    res.json({ message: "Internal Server Error", error: e.message });
  }
});
router.route("/").get(async (req, res) => {
  try {
    res.send("Lending Buddha Auth Home Page");
  } catch (error) {
    console.log(error.message);
    return res.status(error.code).json({
      message: error.message,
    });
  }
});

// UTILS ROUTES
//for Refresh-Token
router.route("/refresh-token").post(verifyToken, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send("No Refresh Token in Cookies");
    }
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    // Check if token verification failed
    if (!decoded) {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    const accessToken = jwt.sign(
      { uid: decoded.uid },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    res.json({ accessToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


//CRUD Opeartion's

router.route("/passwordchange").post(verifyToken, async (req, res) => {
  const { password, confirmpassword } = req.body
  const auth = getAuth();
  console.log(auth);
  const user = auth.currentUser;
  console.log(user);
  if (password !== confirmpassword) {
    res.status(400).json({ error: "Passwords do not match" });
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  reauthenticateWithCredential(user, credential).then(() => {
    // If reauthentication is successful, update the password
    return updatePassword(user, password);
  }).then(() => {
    res.status(200).json({ message: "Password updated successfully!" });
  }).catch((error) => {
    console.error("Error updating password:", error);
  });
});

router.route("/account-deatils-update").patch(verifyToken, async (req, res) => {
  try {
    const { name, email, } = req.body
    const userType = req.user.type
    const auth = getAuth();
    const user = auth.currentUser;
    if (userType == "borrower") {
      if (user) {
        updateEmail(user, email).then(() => {
          res.status(200).json("Email updated successfully!");
          user.sendEmailVerification().then(() => {
            res.status(200).json(`Verification email sent to your ${email}`);
          }).catch((error) => {
            res.status(503).json("Error sending verification email:", error);
          });
        }).catch((error) => {
          res.status(503).json("Error updating email:", error);
        });
      } else {
        res.status(401).json("User is not authenticated");
      }

      const borrower = await Borrower.findOne(req.user.uid);

      if (!borrower) {
        return res.status(404).send('Lender not found');
      }
      // Update both name and email if provided in the request
      if (name) {
        borrower.fullname = name;
      }
      if (email) {
        borrower.email = email;
      }

      // Save the updated lender
      await borrower.save();
      const updateDetails = await Borrower.findById(borrower._id).select("-password -panCard -aadharCard -refreshToken")

      if (!updateDetails) {
        res.status(500).json("Internal Server Error")
      }
      res.status(200).json(borrower, "Email and name update sucessfully")
    }
    if (userType == "lender") {
      if (user) {
        updateEmail(user, email).then(() => {
          res.status(200).json("Email updated successfully!");
          user.sendEmailVerification().then(() => {
            res.status(200).json(`Verification email sent to your ${email}`);
          }).catch((error) => {
            res.status(503).json("Error sending verification email:", error);
          });
        }).catch((error) => {
          res.status(503).json("Error updating email:", error);
        });
      } else {
        res.status(401).json("User is not authenticated");
      }

      const lender = await Lender.findOne(req.user.uid);

      if (!lender) {
        return res.status(404).send('Lender not found');
      }
      // Update both name and email if provided in the request
      if (name) {
        lender.fullname = name;
      }
      if (email) {
        lender.email = email;
      }

      // Save the updated lender
      await lender.save();
      const updateDetails = await Lender.findById(lender._id).select("-password -panCard -aadharCard -refreshToken")

      if (!updateDetails) {
        res.status(500).json("Internal Server Error")
      }
      res.status(200).json(lender, "Email and name update sucessfully")
    }


  } catch (error) {
    res.send(error)
  }

}
)

router.route('/current-user/:id').get(verifyToken, async (req, res) => {
  const userId = req.params.id;
  const userType = req.user.type; // Assuming you have a way to determine user type (lender or borrower)

  try {
    let userData;

    if (userType === 'lender') {
      userData = await Lender.findOne(userId);
    } else if (userType === 'borrower') {
      userData = await Borrower.findOne(userId);
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
