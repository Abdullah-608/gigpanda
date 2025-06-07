import express from "express";
import { Logout, Signin, Signup, verifyEmail, forgotPassword, resetPassword,
    checkAuth, resendVerification
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router= express.Router();

router.get("/check-auth", protectRoute, checkAuth)

router.post("/signup",Signup)
router.post("/login",Signin);
router.post("/logout",Logout);

router.post("/verify-email",verifyEmail);
router.post("/resend-verification",resendVerification);
router.post("/forgot-password",forgotPassword);
router.post("/reset-password/:token",resetPassword);


export default router;