import { auth } from "../config/firebase-config.js";
import {createUserWithEmailAndPassword,signInWithEmailAndPassword } from "firebase/auth";


export const signup = async (req, res) => {
  const { email, password } = req.body;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      res.send(user);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      res.status(errorCode).send(errorMessage);
    });
}
export const login = async(req,res)=>{
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
}
