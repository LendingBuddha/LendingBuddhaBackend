import mongoose, { Schema } from "mongoose";

const LenderSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    panCard: {
      type: String,
      required: true,
      unique: true,
    },
    aadharCard: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    uid: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    profilePic:{type:String}
  },
  {
    timestamps: true,
  }
);

export const Lender = mongoose.model("Lender", LenderSchema);
