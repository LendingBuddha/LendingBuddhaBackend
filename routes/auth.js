import { Router } from "express";
import bcrypt from 'bcrypt'

const router = Router();

//Registeration Route
router.route("/signup/lender").post(async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
  
      // Check if the user already exists
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 15);
  
      // Create a new user
      const newUser = await User.create({
        email,
        password: hashedPassword,
      });
  
      //    check the user is created and remove the password while sending as a response
      const createdUser = await User.findById(newUser._id).select("-passsword");
  
      if (!createdUser) {
        return res.status(400).json({ message: "User not created" });
      }
  
      // Respond with success message
      return res.status(201).json({
        message: "User created successfully",
        data: createdUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.code).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
router.route("/signup/borrower").post(async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(400).json({ message: "Please fill all the fields" });
      }
  
      // Check if the user already exists
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 15);
  
      // Create a new user
      const newUser = await User.create({
        email,
        password: hashedPassword,
      });
  
      //    check the user is created and remove the password while sending as a response
      const createdUser = await User.findById(newUser._id).select("-passsword");
  
      if (!createdUser) {
        return res.status(400).json({ message: "User not created" });
      }
  
      // Respond with success message
      return res.status(201).json({
        message: "User created successfully",
        data: createdUser,
      });
    } catch (error) {
      console.log(error);
      return res.status(error.code).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });

//Login Route
router.route("/login/lender").post(async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(404).json({
          message: "Please fill all the fields",
        });
      }
      const user = await User.findOne(email);
      if (!user) {
        res.status(404).json({
          message: "Lender not found",
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        res.status(401).json({
          message: "Invalid password",
        });
      }
      const createdUser = await User.findById(user._id).select("-passsword");
  
      return res.status(200).json({
        message: "User logged in successfully as Lender",
        data: createdUser,
      });
    } catch (err) {
      console.log(err);
      return res.status(err.code).json({
        message: "Internal Server Error",
        error: err.message,
      });
    }
  });
router.route("/login/borrower").post(async (req, res) => {
    try {
      const { email, password } = req.body;
      // Check if email and password are provided
      if (!email || !password) {
        return res.status(404).json({
          message: "Please fill all the fields",
        });
      }
      const user = await User.findOne(email);
      if (!user) {
        res.status(404).json({
          message: "Lender not found",
        });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        res.status(401).json({
          message: "Invalid password",
        });
      }
      const createdUser = await User.findById(user._id).select("-passsword");
  
      return res.status(200).json({
        message: "User logged in successfully as Lender",
        data: createdUser,
      });
    } catch (err) {
      console.log(err);
      return res.status(err.code).json({
        message: "Internal Server Error",
        error: err.message,
      });
    }
  });

// HomeRoute
router.route("/lenderhome").get( async (req, res) => {
    try {
      return res.status(200).json({
        message: "Welcome to Lender Home",
      });
    } catch (e) {
      console.log(e);
      res
        .status(e.code || 500)
        .json({ message: "Internal Server Error", error: e.message });
    }
  })
router.route("/borrowerhome").get( async (req, res) => {
    try {
      return res.status(200).json({
        message: "Welcome to Borrower Home",
      });
    } catch (e) {
      console.log(e);
      res
        .status(e.code || 500)
        .json({ message: "Internal Server Error", error: e.message });
    }
  })

export default router;
