import {Router} from "express";
import {Signup, Login, Logout, Profile, Delete} from "../controllers/user.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/signup", Signup);
router.delete("/delete",authMiddleware, Delete);

router.post("/login",Login)
router.post("/logout", authMiddleware, Logout)
router.get("/profile", authMiddleware, Profile)

export default router;