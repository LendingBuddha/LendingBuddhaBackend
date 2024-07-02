import { Router } from "express";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
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
import verifyToken from "../middleware/authencate.js";
import { upload } from "../middleware/multer.js";
import admin from "../config/firebase-admin.mjs";


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

const generateJWT = (uid, type, time) => {
  return jwt.sign({ uid: uid, type: type }, process.env.JWT_SECRET_KEY, { expiresIn: `${time}` });
};



//POST - Register new user
router.post("/signup/lender", upload.single("profilePic"), async (req, res) => {
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
router.post("/signup/borrower", upload.single("profilePic"), async (req, res) => {
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


    // console.log("PanCard \t ", hashPan);
    // console.log("Aadhar \t ", hashAadhar);

    const borrowerUser = await Borrower.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: pancard,
      aadharCard: aadharcard,
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
  // console.log(email, password);

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
router.route("/lenderhome").get(verifyToken, async (req, res) => {
  try {
    if (req.user.type === "lender") {
      return res.status(200).json({
        message: "Welcome to Protected Route of Lender Home",
        data: req.user.uid,
      });
    } else {
      return res.status(401).send("Your are not Lender ")
    }
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: e.message });
  }
});
router.route("/borrowerhome").get(verifyToken, async (req, res) => {
  try {
    if (req.user.type === "borrower") {
      return res.status(200).json({
        message: "Welcome to Protected Route of Borrower Home",
        data: req.user.uid,
      })
    } else {
      return res.status(401).send("Your are not Borrower ")
    }
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
router.route("/refreshtoken").get(verifyToken, async (req, res) => {
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
      { uid: decoded.uid,type:decoded.type },
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
  if (password !== confirmpassword) {
    res.status(400).json({ error: "Passwords do not match" });
  }
  try {
    await admin.auth().updateUser(req.user.uid, {
      password: password,
    });
    res.status(200).json('Password changed successfully');
  } catch (error) {
    console.error('Error changing password :', error);
    res.status(500).json("Internal Server Error") // Handle error as needed
  }

});

router.route("/account-deatils-update").patch(verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userType = req.user.type;
    
    // console.log(auth);

    if (!userType) {
      return res.status(401).json("User is not authenticated");
    }

    if (userType === "borrower") {
      // Update email and send verification email
      await admin.auth().updateUser(req.user.uid, {
        email: email
      });

      const borrower = await Borrower.findOne({ uid: req.user.uid });
      if (!borrower) {
        return res.status(404).json('Borrower not found');
      }

      // Update borrower's name if provided
      if (name) {
        borrower.fullname = name;
      }
      if (email) {
        borrower.email = email;
      }

      await borrower.save();

      // Fetch updated details and send response
      const updateDetails = await Borrower.findById(borrower._id).select("-password -panCard -aadharCard -refreshToken");
      if (!updateDetails) {
        return res.status(500).json("Internal Server Error");
      }

      return res.status(200).json({
        message: "Email and name updated successfully",
        updateDetails: updateDetails
      });
    }

    if (userType === "lender") {
      // Update email and send verification email
      await admin.auth().updateUser(userId, {
        email: email
      });
      const lender = await Lender.findOne({ uid: req.user.uid });
      if (!lender) {
        return res.status(404).json('Lender not found');
      }

      // Update lender's name if provided
      if (name) {
        lender.fullname = name;
      }
      if (email) {
        lender.email = email;
      }

      await lender.save();

      // Fetch updated details and send response
      const updateDetails = await Lender.findById(lender._id).select("-password -panCard -aadharCard -refreshToken");
      if (!updateDetails) {
        return res.status(500).json("Internal Server Error");
      }

      return res.status(200).json({
        message: "Email and name updated successfully",
        updateDetails: updateDetails
      });
    }

    // Handle unexpected userType
    return res.status(400).json("Invalid userType");

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
})

router.route('/current-user').get(verifyToken, async (req, res) => {
  const userId = req.user.uid;
  const userType = req.user.type;

  try {
    let userData;

    if (userType === 'lender') {
      userData = await Lender.findOne({ uid: userId }).select('-refreshToken');
    } else if (userType === 'borrower') {
      userData = await Borrower.findOne({ uid: userId }).select('-refreshToken');
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userData.decryptFields();
    console.log(userData)
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.route('/delete-user/:id').delete(verifyToken, async (req, res) => {
  const userId = req.params.id;
  const userType = req.user.type;

  try {
    if (userType === "lender") {
      await Lender.findOneAndDelete({uid:userId})
      await admin.auth().deleteUser(userId)
      res.status(200).json(`Successfully deleted Lender with UID: ${req.user.uid}`)
    } else if (userType === "borrower") {
      await Borrower.findOneAndDelete({uid:userId})
      await admin.auth().deleteUser(userId)
      res.status(200).json(`Successfully deleted Borrower with UID: ${req.user.uid}`)
    } else {
      res.status(200).json("You are not Lender or Borrower")
    }

  } catch (error) {
    console.log(error)
    res.status(500).json("Internal Server Error")
  }
})

// Logout Route

router.route("/logout").get(verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    if (req.user.type === "lender") {
      await Lender.findOneAndUpdate({ uid }, { $unset: { refreshToken: 1 } }, { new: true });
    } else if (req.user.type === "borrower") {
      await Borrower.findOneAndUpdate({ uid }, { $unset: { refreshToken: 1 } }, { new: true });
    } else {
      throw new Error('Invalid user type');
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("refreshToken", options).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Failed to logout user", error: error.message });
  }
})

export default router;
