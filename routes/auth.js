import { Router } from "express";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase-config.js";
import { Lender } from "../models/Lender.js";
import { Borrower } from "../models/Borrower.js";
import bcrypt from "bcrypt";
import verifyToken from "../middleware/authencate.js";
import jwt from "jsonwebtoken";

const router = Router();

//POST - Register new user
router.post("/signup/lender", async (req, res) => {
  const { fullname, email, password, dob, pancard, aadharcard, phonenumber } =
    req.body;
  try {
    const LenderUser = await Lender.findOne({ email });

    if (LenderUser) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const hashPan = await bcrypt.hash(pancard, 10);
    const hashAadhar = await bcrypt.hash(aadharcard, 10);

    console.log("PanCard \t ", hashPan);
    console.log("Aadhar \t ", hashAadhar);

    const Lenderuser = await Lender.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: hashPan,
      aadharCard: hashAadhar,
      uid: user.uid,
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
router.post("/signup/borrower", async (req, res) => {
  const { fullname, email, password, dob, pancard, aadharcard, phonenumber } =
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
    const hashPan = await bcrypt.hash(pancard, 10);
    const hashAadhar = await bcrypt.hash(aadharcard, 10);

    console.log("PanCard \t ", hashPan);
    console.log("Aadhar \t ", hashAadhar);

    const borrowerUser = await Borrower.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: hashPan,
      aadharCard: hashAadhar,
      uid: user.uid,
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
      const accessToken = jwt.sign(
        { uid: user.uid },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30m" }
      );

      const refreshToken = jwt.sign(
        { uid: user.uid },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

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
router.post("/login/borrower", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // console.log(user);
      // ...
      const refreshToken = jwt.sign(
        { uid: user.uid },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );
      const accessToken = jwt.sign(
        { uid: user.uid },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30m" }
      );

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
router.route("/borrowerhome").get(verifyToken, async (req, res) => {
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

export default router;
