import { auth } from "../config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import connectDb from "../config/db.js";

export const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await connectDb();
    const user = null;
    console.log(user);
    // const user_exists = await db.collection("users").findOne({ user_email: email });
    // if (user_exists) return res.send("User Exists");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      user = userCredential.user;
      console.log({uid: user.uid,
        user_name: user.displayName,
        user_email: user.email,})
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      res.status(errorCode).send({ error: errorMessage });
    }

    // await db.collection("users").insertOne({
    //   uid: user.uid,
    //   user_name: user.displayName,
    //   user_email: user.email,
    // });
    // res.status(201).send("User created!");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
export const login = async (req, res) => {
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
};
