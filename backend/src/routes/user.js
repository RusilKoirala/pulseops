import {Router} from "express";
import {Signup, Login, Logout, Profile, Delete, VerifyEmail, ResendVerification, ChangePassword, DemoLogin} from "../controllers/user.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// logging in and out 
router.post("/signup", Signup);
router.post("/login",Login);

router.post("/logout", authMiddleware, Logout);


// Profile info and delete
router.delete("/delete",authMiddleware, Delete);
router.get("/profile", authMiddleware, Profile);
router.put("/password", authMiddleware, ChangePassword)



// Verification
router.get("/verify-email", VerifyEmail);
router.post("/resend-verification", authMiddleware, ResendVerification);


// Demo 

router.post("/demo", DemoLogin)

export default router;