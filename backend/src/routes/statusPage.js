import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { createStatusPage, getStatusPage, getStatusPagesByMonitor } from "../controllers/statusPage";
import { createIncident, getIncidentsByMonitor, updateIncident } from "../controllers/incident";

const router = Router();

// status Page
router.post("/", authMiddleware, createStatusPage)
router.get("/monitor/:monitorId", authMiddleware, getStatusPagesByMonitor)




// anyone can access :)
router.get("/:id", getStatusPage)


// incidents
router.post("/incidents", authMiddleware, createIncident)
router.get("/incidents/monitor/:monitorId", authMiddleware, getIncidentsByMonitor)
router.put("/incidents/:id", authMiddleware, updateIncident)

export default router