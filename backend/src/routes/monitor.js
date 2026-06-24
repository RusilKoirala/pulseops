import {Router} from "express";
import  {ListAllMonitor, DeleteMonitor, CreateMonitor, ListMonitorChecks}  from "../controllers/monitor.js";
const router = Router();

router.get("/", ListAllMonitor)
router.post("/", CreateMonitor )
router.delete("/:id",DeleteMonitor)
router.get("/:id/checks", ListMonitorChecks )

export default router;
