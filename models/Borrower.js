import mongoose, { Schema } from "mongoose";

const BorrowerSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      index: true,
      required: true,
      unique: true,
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

export const Borrower = mongoose.model("Borrower", BorrowerSchema);
