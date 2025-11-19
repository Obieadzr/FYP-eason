import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import unitRoutes from "./routes/unitRoutes.js"
import productRoutes from "./routes/productRoutes.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/products", productRoutes);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use('/api/auth',authRoutes)
app.get("/",(req,res)=>{
    res.send("eAson backend running")
})
app.listen(5000,()=>console.log("server running on port 5000"))
