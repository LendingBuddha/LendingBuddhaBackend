import { Router } from "express";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase-config.js";
import { Lender } from "../models/Lender.js";
import { Borrower } from "../models/Borrower.js";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";
import * as fs from "node:fs/promises";
import verifyToken from "../middleware/authencate.js";
import { upload } from "../middleware/multer.js";
import admin from "../config/firebase-admin.mjs";
import path from "node:path";

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

async function uploadImage(filePath) {
  try {
    // console.log(filePath);
    if (!filePath) throw new Error("Could not find the path");

    // Read file data
    const data = await fs.readFile(filePath);
    const base64data = Buffer.from(data).toString("base64");

    // Upload to ImageKit
    const result = await imagekit.upload({
      // file: filePath.path,
      file: base64data,
      fileName: "Image",
    });
    // console.log(result);
    const fullPath = path.resolve(filePath);
    // Delete local file after successful upload
    await fs.unlink(fullPath);

    return result;
  } catch (error) {
    console.log({ message: error.message }); // Log the error message
    throw error; // Propagate the error for further handling
  }
}

const router = Router();

const generateJWT = (uid, type, time) => {
  return jwt.sign({ uid: uid, type: type }, process.env.JWT_SECRET_KEY, {
    expiresIn: `${time}`,
  });
};

//POST - Register new Lender
router.post("/signup/lender", upload.single("profilePic"), async (req, res) => {
  const {
    fullname,
    email,
    password,
    // dob,
    // pancard,
    // aadharcard,
    phonenumber,
    // cibilscore,
  } = req.body;

  const profilePic = req.file ? req.file.path : null;

  if (!profilePic) {
    return res.status(400).json({ error: "Profile Pic is required" });
  }

  try {
    // Check if the user already exists in the database
    const LenderUser = await Lender.findOne({ email });
    if (LenderUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Upload profile picture
    const result = await uploadImage(profilePic);
    if (!result || !result.url) {
      return res
        .status(500)
        .json({ error: "Failed to upload profile picture" });
    }

    // Save user details in the database
    const Lenderuser = await Lender.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      // dateOfBirth: dob,
      // panCard: pancard,
      // cibilScore: cibilscore,
      // aadharCard: aadharcard,
      // profilePic: result.url,
    });

    // If database entry is successful, create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update the database entry with the Firebase user ID
    Lenderuser.uid = user.uid;
    await Lenderuser.save();

    // Retrieve the created user without sensitive information
    const createdUser = await Lender.findById(Lenderuser._id).select(
      "-panCard -aadharCard"
    );
    if (!createdUser) {
      return res.status(500).send("Internal Error");
    }

    res.status(201).json({
      message: "Lender User created",
      data: createdUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// post route Borrower
router.post("/signup/borrower",upload.single("profilePic"),async (req, res) => {
    const {
      fullname,
      email,
      password,
      // dob,
      // pancard,
      // aadharcard,
      phonenumber,
      // cibilscore,
    } = req.body;
    const profilePic = req.file?.path;

    try {
      // Check if user already exists
      const existingBorrower = await Borrower.findOne({ email });
      if (existingBorrower) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Upload profile picture
      const result = await uploadImage(profilePic);
      if (!result || !result.url) {
        return res
          .status(500)
          .json({ error: "Failed to upload profile picture" });
      }

      // Save user details in the database
      const borrowerUser = await Borrower.create({
        email,
        fullname,
        phoneNumber: phonenumber,
        // dateOfBirth: dob,
        // panCard: pancard,
        // aadharCard: aadharcard,
        // cibilScore: cibilscore,
        // profilePic: result.url,
      });

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update the database entry with the Firebase user ID
      borrowerUser.uid = user.uid;
      await borrowerUser.save();

      // Retrieve the created user without sensitive information
      const createdUser = await Borrower.findById(borrowerUser._id).select(
        "-panCard -aadharCard"
      );
      if (!createdUser) {
        return res.status(500).send("Internal Error");
      }

      // Respond with success message and user data
      res.status(201).json({
        message: "Borrower User created",
        data: createdUser,
      });
    } catch (error) {
      // Handle errors
      console.error("Error in signup borrower route:", error);
      res
        .status(500)
        .json({
          message: "Error in Signup Borrower Route",
          error: error.message,
        });
    }
  }
);

// POST- Login user
router.post("/login/lender", async (req, res) => {
  const { email, password } = req.body;
  // console.log("Login request received:", req.body);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // console.log("User signed in:", user);

    const accessToken = generateJWT(user.uid, "Lender", "30m");
    const refreshToken = generateJWT(user.uid, "Lender", "30d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      // sameSite: "strict",
    });

    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.status(200).json({
      message: "Lender logged in successfully",
      data: {
        email: user.email,
        uid: user.uid,
        displayName: user.fullName,
        role: "lender"
      },
      refreshToken: refreshToken,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).send(error.message);
  }
});

router.post("/login/borrower", async (req, res) => {
  const { email, password } = req.body;
 
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      const accessToken = generateJWT(user.uid, "Borrower", "30m");
      const refreshToken = generateJWT(user.uid, "Borrower", "30d");

      // Set refresh token in an HTTP-only and secure cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        // sameSite: "strict",
      });

      res.setHeader("Authorization", `Bearer ${accessToken}`);

      // Send response indicating successful login
      res.status(200).json({
        message: "Borrower logged in successfully",
        data: {
          email: user.email,
          uid: user.uid,
          name: user.fullName,
          role: "borrower",
        },
        refreshToken: refreshToken,
      });
    })
    .catch((error) => {
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
      return res.status(401).send("Your are not Lender ");
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
      });
    } else {
      return res.status(401).send("Your are not Borrower ");
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
      return res.status(401).json({ error: "No Refresh Token in Cookies" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    // Generate new access token
    const accessToken = jwt.sign(
      { uid: decoded.uid, type: decoded.type },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    // Set the new access token in the Authorization header
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    // Send the new access token in the response
    res.status(200).json({ accessToken });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res.status(403).json({ error: "Refresh token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid refresh token" });
    }

    console.error("Error refreshing token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//CRUD Opeartion's

router.route("/passwordchange").post(verifyToken, async (req, res) => {
  const { password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Update password in Firebase Auth
    await admin.auth().updateUser(req.user.uid, {
      password: password,
    });

    // Respond with success message
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    // Handle Firebase errors
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/account-details-update").patch(verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userType = req.user.type;
    const userId = req.user.uid;

    if (!userType) {
      return res.status(401).json("User is not authenticated");
    }

    // Update email in Firebase Auth and send verification email if needed
    if (email) {
      await admin.auth().updateUser(userId, { email: email });
    }

    let user;
    if (userType === "borrower") {
      user = await Borrower.findOne({ uid: userId });
      if (!user) {
        return res.status(404).json("Borrower not found");
      }
    } else if (userType === "lender") {
      user = await Lender.findOne({ uid: userId });
      if (!user) {
        return res.status(404).json("Lender not found");
      }
    } else {
      return res.status(400).json("Invalid userType");
    }

    // Update user's name if provided
    if (name) {
      user.fullname = name;
    }
    if (email) {
      user.email = email;
    }

    await user.save();

    // Fetch updated details and send response
    const updateDetails = await user.constructor
      .findById(user._id)
      .select("-password -panCard -aadharCard -refreshToken");
    if (!updateDetails) {
      return res.status(500).json("Internal Server Error");
    }

    return res.status(200).json({
      message: "Email and name updated successfully",
      updateDetails: updateDetails,
    });
  } catch (error) {
    console.error("Error updating account details:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.route("/current-user").get(verifyToken, async (req, res) => {
  const { uid: userId, type: userType } = req.user;

  try {
    let userData;

    if (userType === "lender") {
      userData = await Lender.findOne({ uid: userId }).select("-refreshToken");
    } else if (userType === "borrower") {
      userData = await Borrower.findOne({ uid: userId }).select(
        "-refreshToken"
      );
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    if (typeof userData.decryptFields === "function") {
      userData = userData.decryptFields();
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/delete-user/:id").delete(verifyToken, async (req, res) => {
  const userId = req.params.id;
  const userType = req.user.type;

  try {
    if (userType === "lender") {
      const lender = await Lender.findOneAndDelete({ uid: userId });
      if (!lender) {
        return res.status(404).json({ error: "Lender not found" });
      }
      await admin.auth().deleteUser(userId);
      res
        .status(200)
        .json({ message: `Successfully deleted Lender with UID: ${userId}` });
    } else if (userType === "borrower") {
      const borrower = await Borrower.findOneAndDelete({ uid: userId });
      if (!borrower) {
        return res.status(404).json({ error: "Borrower not found" });
      }
      await admin.auth().deleteUser(userId);
      res
        .status(200)
        .json({ message: `Successfully deleted Borrower with UID: ${userId}` });
    } else {
      res.status(403).json({ error: "Unauthorized user type" });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout Route
router.route("/logout").get(verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    let user;

    // Find and update user to unset refreshToken
    if (req.user.type === "lender") {
      user = await Lender.findOneAndUpdate(
        { uid },
        { $unset: { refreshToken: 1 } },
        { new: true }
      );
    } else if (req.user.type === "borrower") {
      user = await Borrower.findOneAndUpdate(
        { uid },
        { $unset: { refreshToken: 1 } },
        { new: true }
      );
    } else {
      throw new Error("Invalid user type");
    }

    // Clear refreshToken cookie
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };
    res.clearCookie("refreshToken", options);

    // Respond with success message
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    // Handle errors
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ message: "Failed to logout user", error: error.message });
  }
});

// Get any User Details

router.route("/details/:id").get(verifyToken, async (req, res) => {
  const borrowerId = req.params.id;
  const userType = req.user.type;

  try {
    if (userType !== "lender") {
      return res.status(403).json({
        error: "Unauthorized access. Only lenders can view borrower details.",
      });
    }

    const borrowerData = await Borrower.findOne({ uid: borrowerId }).select(
      "-refreshToken -panCard -aadharCard"
    );

    if (!borrowerData) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.status(200).json(borrowerData);
  } catch (error) {
    console.error("Error fetching borrower details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get ALL User

router.route("/lender/users").get(verifyToken, async (req, res) => {
  try {
    const userType = req.user.type;

    // if (userType !== "lender") {
    //   return res.status(403).json({ error: "Unauthorized access" });
    // }

    // Fetch all lenders excluding refreshToken
    const lenders = await Lender.find().select(
      "-refreshToken -panCard -aadharCard"
    );

    // Check if lenders array is empty
    if (lenders.length === 0) {
      return res.status(404).json({ error: "No lenders found" });
    }

    // Decrypt sensitive fields for each lender
    for (let lender of lenders) {
      if (typeof lender.decryptFields === "function") {
        await lender.decryptFields();
      }
    }

    // Respond with decrypted lenders data
    res.status(200).json(lenders);
  } catch (error) {
    console.error("Error fetching lenders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/borrower/users").get(verifyToken, async (req, res) => {
  try {
    const userType = req.user.type;

    // if (userType !== "borrower") {
    //   return res.status(403).json({ error: "Unauthorized access" });
    // }

    // Fetch all borrowers excluding refreshToken
    const borrowers = await Borrower.find().select("-refreshToken ");

    // Check if borrowers array is empty
    if (borrowers.length === 0) {
      return res.status(404).json({ error: "No borrowers found" });
    }

    // Decrypt sensitive fields for each borrower
    for (let borrower of borrowers) {
      if (typeof borrower.decryptFields === "function") {
        await borrower.decryptFields();
      }
    }

    // Respond with decrypted borrowers data
    res.status(200).json(borrowers);
  } catch (error) {
    console.error("Error fetching borrowers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Search Route
router.route("/lender/search").get(verifyToken, async (req, res) => {
  try {
    const {
      fullname,
      email,
      phoneNumber,
      uid,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};
    if (fullname) {
      query.fullname = { $regex: new RegExp(fullname, "i") };
      if (email) {
        query.email = { $regex: new RegExp(email, "i") };
      }
      if (phoneNumber) {
        query.phoneNumber = phoneNumber;
      }
      if (uid) {
        query.uid = uid;
      }

      const skip = (page - 1) * limit;
      const lenders = await Lender.find(query)
        .skip(skip)
        .limit(parseInt(limit, 10));

      const totalCount = await Lender.countDocuments(query);
      res.json({
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalCount / limit),
        data: lenders,
      });
    }
  } catch (error) {
    console.error("Error searching lenders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/borrower/search").get(verifyToken, async (req, res) => {
  try {
    const {
      fullname,
      email,
      phoneNumber,
      uid,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};
    if (fullname) {
      query.fullname = { $regex: new RegExp(fullname, "i") };
      if (email) {
        query.email = { $regex: new RegExp(email, "i") };
      }
      if (phoneNumber) {
        query.phoneNumber = phoneNumber;
      }
      if (uid) {
        query.uid = uid;
      }

      const skip = (page - 1) * limit;
      const borrowers = await Borrower.find(query)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .select("-panCard -aadharCard");

      const totalCount = await Borrower.countDocuments(query);
      res.json({
        total: totalCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalCount / limit),
        data: borrowers,
      });
    }
  } catch (error) {
    console.error("Error searching borrower:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
