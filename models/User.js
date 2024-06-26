import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please Enter the UserName"],
      unique: true,
    },
    password: { type: String, required: [true,"Enter At least 6 Character"] },
  },
  { timestamps: true }
);

// Always export Module With Same of Model Name
export const User = mongoose.model("User", UserSchema);



