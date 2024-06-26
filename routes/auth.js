import { Router } from "express";
import connectDb from "../config/db.js";
import {createUserWithEmailAndPassword,signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../config/firebase-config.js'



const router = Router();


//POST - Register new user
router.post("/signup/lender", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const db = await connectDb();
    let user = null;
    const user_exists = await db
      .collection("users_lender")
      .findOne({ user_email: email });
    if (user_exists) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user = userCredential.user;
    await db.collection("users_lender").insertOne({
      uid: user.uid,
      user_name: name,
      user_email: user.email,
    });
    res.status(201).send("User created!");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(errorCode).send({ error: errorMessage });
  }
});
router.post("/signup/borrower", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const db = await connectDb();
    let user = null;
    const user_exists = await db
      .collection("users_borrower")
      .findOne({ user_email: email });
    if (user_exists) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user = userCredential.user;
    await db.collection("users_borrower").insertOne({
      uid: user.uid,
      user_name: name,
      user_email: user.email,
    });
    res.status(201).send("User created!");
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    res.status(errorCode).send({ error: errorMessage });
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

// GET - HOME_ROUTE
router.route("/lenderhome").get( async (req, res) => {
  try {
    return res.status(200).send(
       "Welcome to Lender Home"
    );
  } catch (e) {
    console.log(e);
    res
      .status(e.code || 500)
      .json({ message: "Internal Server Error", error: e.message });
  }
})
router.route("/borrowerhome").get( async (req, res) => {
  try {
    return res.status(200).send(
      "Welcome to Borrower Home"
    );
  } catch (e) {
    console.log(e);
    res
      .status(e.code || 500)
      .json({ message: "Internal Server Error", error: e.message });
  }
})
router.route("/").get(async(req,res)=>{
  try {
    res.send("Lending Buddha Auth Home Page")
    
  } catch (error) {
    console.log(error.message);
    return res.status(error.code).json({
      message:error.message
    })
  }
})


export default router;
