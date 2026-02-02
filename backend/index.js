import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import petRoutes from "./routes/petRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import uploadRoutes from "./routes/uploadRoutes.js"
// import doctorRoutes from "./routes/doctorRoutes.js";
// import petOwnerRoutes from "./routes/petOwnerRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();
const port = process.env.PORT || 5000;

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use('/api/upload',uploadRoutes);
app.use('/api/pets',petRoutes);
app.use('/api/appointments',appointmentRoutes);


  const __dirname =path.resolve()
  app.use('/uploads',express.static(path.join(__dirname+"/uploads")));

app.listen(port, () => console.log(`Server running on port ${port}`));