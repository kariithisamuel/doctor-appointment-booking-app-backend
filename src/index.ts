import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import myAppointmentRoute from "./routes/MyAppointmentRoute";
import appointmentRoute from "./routes/AppointmentRoute";
import bookingRoute from "./routes/BookingRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Connected to database!"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());

app.use("/api/booking/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health OK!" });
});



app.use("/api/my/user", myUserRoute);
app.use("/api/my/appointment", myAppointmentRoute);
app.use("/api/appointment", appointmentRoute);
app.use("/api/booking", bookingRoute);

app.listen(7000, () => {
  console.log("server started on localhost:7000");
});
