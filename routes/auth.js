import { Router } from "express";
import { LenderLogin, LenderSignUp } from "../controller/lender.js";
import { BorrowerSignUp } from "../controller/borrower.js";

const router = Router();

//Registeration Route
router.route("/signup/lender").post(LenderSignUp);
router.route("/signup/borrower").post(BorrowerSignUp);

//Login Route
router.route("/login/lender").post(LenderLogin);

export default router;
