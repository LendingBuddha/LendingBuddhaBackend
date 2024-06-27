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

    console.log("PanCard \t ",hashPan)
    console.log("Aadhar \t ",hashAadhar)

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

    console.log("PanCard \t ",hashPan)
    console.log("Aadhar \t ",hashAadhar)

    const borrowerUser = await Borrower.create({
      email,
      fullname,
      phoneNumber: phonenumber,
      dateOfBirth: dob,
      panCard: hashPan,
      aadharCard:hashAadhar,
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
      res.send(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(errorCode).send(errorMessage);
    });
});
router.post("/login/borrower", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      // ...
      res.status(200).json(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(errorCode).send(errorMessage);
    });
});

// GET - HOME_ROUTE
router.route("/lenderhome").get(verifyToken,async (req, res) => {
  try {
    return res.status(200).send("Welcome to Lender Home",req.user);
  } catch (e) {
    console.log(e);
    res
      .status(e.code || 500)
      .json({ message: "Internal Server Error", error: e.message });
  }
});
router.route("/borrowerhome").get(verifyToken,async (req, res) => {
  try {
    return res.status(200).send("Welcome to Borrower Home",req.user);
  } catch (e) {
    console.log(e);
    res
      .status(e.code || 500)
      .json({ message: "Internal Server Error", error: e.message });
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

export default router;
