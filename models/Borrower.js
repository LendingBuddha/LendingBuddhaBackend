import mongoose, { Schema } from "mongoose";
import { decrypt, encrypt } from "../utils/encryption.js";

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
    profilePic: {
      type: String,
    },
    cibilScore: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

BorrowerSchema.pre('save', function (next) {
  try {
    if (this.isModified('aadharCard')) {
      this.aadharCard = encrypt(this.aadharCard);
    }
    if (this.isModified('panCard')) {
      this.panCard = encrypt(this.panCard);
    }
    next();
  } catch (error) {
    next(error);
  }
});

BorrowerSchema.methods.decryptFields = function () {
  try {
    this.aadharCard = decrypt(this.aadharCard);
    this.panCard = decrypt(this.panCard);
  } catch (error) {
    console.error('Error decrypting fields:', error);
  }
  return this;
};

export const Borrower = mongoose.model("Borrower", BorrowerSchema);
