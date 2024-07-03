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
    profilePic:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);


LenderSchema.pre('save', function (next) {
  this.aadharCard = encrypt(this.aadharCard);
  this.panCard = encrypt(this.panCard);
  next();
});

LenderSchema.methods.decryptFields = function () {
  this.aadharCard = decrypt(this.aadharCard);
  this.panCard = decrypt(this.panCard);
  return this;
};

export const Lender = mongoose.model("Lender", LenderSchema);
