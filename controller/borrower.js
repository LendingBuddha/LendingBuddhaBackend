import { User } from "../models/User.js";
import bcrypt from "bcrypt";

const BorrowerSignUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    // Check if the user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Borrower already exists" });
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
      return res.status(400).json({ message: "Borrower not created" });
    }

    // Respond with success message
    return res.status(201).json({
      message: "Borrower created successfully ",
      data: createdUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(error.code).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export {
    BorrowerSignUp,
}
