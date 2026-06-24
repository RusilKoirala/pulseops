import express, { json } from "express"
import cors from "cors"
import db from "./src/lib/db.js"
import { sql } from "drizzle-orm"
import 'dotenv/config' 
import monitorRoutes from "./src/routes/monitor.js"

const app = express();

app.use(express.json())


// Cors setting
app.use(cors({
    
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


app.listen(3000, ()=>{
    console.log(`Server is running at port http://localhost:${process.env.PORT || 3000}`)
})
