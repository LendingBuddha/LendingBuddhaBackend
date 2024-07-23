import mongoose, { Schema } from "mongoose";
import { decrypt, encrypt } from "../utils/encryption.js";

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
    uid: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Lender = mongoose.model("Lender", LenderSchema);
