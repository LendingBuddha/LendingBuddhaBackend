import express from "express";
import { Lender } from "../models/Lender.js"; // Make sure the path to Lender.js is correct

const router = express.Router();

const getAllLenders = async (req, res) => {
  try {
    let lenders = await Lender.find();
    lenders = lenders.map(lender => lender.decryptFields());
    res.status(200).json(lenders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Define the route
router.get("/", getAllLenders);

export default router;
