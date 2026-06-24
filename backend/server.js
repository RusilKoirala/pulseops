import express, { json } from "express"
import cors from "cors"

const app = express();

app.use(express.json())


// Cors setting
app.use(cors({
    
}))

// Routes 
app.get("/healthz", (req,res)=> {
    res.json({
        "Status" : "Server is healthy :)",
    })
})



app.listen(3000, ()=>{
    console.log(`Server is running at port http://localhost:${process.env.PORT || 3000}`)
})