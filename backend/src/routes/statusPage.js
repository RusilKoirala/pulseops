import { Router } from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
  createStatusPage,
  getStatusPage,
  getStatusPagesByMonitor
} from "../controllers/statusPage.js"
import {
  createIncident,
  getIncidentsByMonitor,
  updateIncident
} from "../controllers/incident.js"

const router = Router()

router.post("/", authMiddleware, createStatusPage)
router.get("/monitor/:monitorId", authMiddleware, getStatusPagesByMonitor)
router.get("/:id", getStatusPage)

router.post("/incidents", authMiddleware, createIncident)
router.get("/incidents/monitor/:monitorId", authMiddleware, getIncidentsByMonitor)
router.put("/incidents/:id", authMiddleware, updateIncident)

export default router
