import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use('/api/auth',authRoutes)
app.get("/",(req,res)=>{
    res.send("eAson backend running")
})
app.listen(5000,()=>console.log("server running on port 5000"))
