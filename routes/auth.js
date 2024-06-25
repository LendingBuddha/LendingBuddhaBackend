import { Router } from "express";
import { LenderHome, LenderLogin, LenderSignUp } from "../controller/lender.js";
import { BorrowerHome, BorrowerSignUp } from "../controller/borrower.js";

const router = Router();

//Registeration Route
router.route("/signup/lender").post(LenderSignUp);
router.route("/signup/borrower").post(BorrowerSignUp);

//Login Route
router.route("/login/lender").post(LenderLogin);

// HomeRoute
router.route("/lenderhome").get(LenderHome)
router.route("/borrowerhome").get(BorrowerHome)

export default router;
