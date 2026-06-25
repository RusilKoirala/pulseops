import {Router} from "express";
import  {ListAllMonitor, DeleteMonitor, CreateMonitor, ListMonitorChecks, MonitorStatus, ManualCheck}  from "../controllers/monitor.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, ListAllMonitor)
router.post("/",authMiddleware, CreateMonitor )
router.delete("/:id",authMiddleware, DeleteMonitor)
router.get("/:id/checks", authMiddleware, ListMonitorChecks )

router.get("/:id/status", authMiddleware, MonitorStatus )
router.post("/:id/check", authMiddleware, ManualCheck)

export default router;
