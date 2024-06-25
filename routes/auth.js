import express from "express";

const router = express.Router();
//POST - Register new user
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const db = await connectDb();
    let user = null;
    const user_exists = await db
      .collection("users")
      .findOne({ user_email: email });
    if (user_exists) return res.send("User Exists");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    user = userCredential.user;
    await db.collection("users").insertOne({
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
router.post("/login", async (req, res) => {
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
export default router;
