import express, { json } from "express"
import cors from "cors"
import db from "./src/lib/db.js"
import { sql } from "drizzle-orm"
import 'dotenv/config' 
import monitorRoutes from "./src/routes/monitor.js"
import { startSchedular } from "./src/services/checker.js"
import userRoutes from "./src/routes/user.js"
import teamRoutes from "./src/routes/team.js"
import statusPageRoutes from "./src/routes/statusPage.js"
 import cookieParser from "cookie-parser"

const app = express();

app.use(express.json())
app.use(cookieParser())



// Cors setting
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pulseops.rusil.me",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))


// Heatlth route
app.get("/healthz", async (req,res)=> {
    try {
        await db.execute(sql`SELECT 1`)

        res.json({
            success: true,
            message: "Server is healthy :)"
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is unhealthy :(",
            error: error.message
        })
    }
})


app.use("/api/monitors", monitorRoutes)
app.use("/api/users", userRoutes)
app.use("/api/teams",teamRoutes)
app.use("/api/status-pages", statusPageRoutes)


const PORT = process.env.PORT || 3000
app.listen(PORT,  async()=>{
    console.log(`Server is running at port http://localhost:${PORT}`)
    await startSchedular()
})

