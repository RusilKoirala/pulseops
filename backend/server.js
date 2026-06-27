import express, { json } from "express"
import cors from "cors"
import db from "./src/lib/db.js"
import { sql } from "drizzle-orm"
import 'dotenv/config' 
import monitorRoutes from "./src/routes/monitor.js"
import { startSchedular } from "./src/services/checker.js"
import userRoutes from "./src/routes/user.js"
import teamRoutes from "./src/routes/team.js"


const app = express();

app.use(express.json())


// Cors setting
app.use(cors({
  origin: "http://localhost:5173",
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


const PORT = process.env.PORT || 3000
app.listen(PORT,  async()=>{
    console.log(`Server is running at port http://localhost:${PORT}`)
    await startSchedular()
})

