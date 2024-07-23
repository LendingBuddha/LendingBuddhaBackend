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
    uid: {
      type: String,
      unique: true,
    },
    refreshToken: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export const Borrower = mongoose.model("Borrower", BorrowerSchema);
