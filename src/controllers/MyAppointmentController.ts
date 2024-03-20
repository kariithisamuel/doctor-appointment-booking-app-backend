import { Request, Response } from "express";
import Appointment from "../models/appointment";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Booking from "../models/booking";

const getMyAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findOne({ user: req.userId });
    if (!appointment) {
      return res.status(404).json({ message: "appointment not found" });
    }
    res.json(appointment);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching appointment" });
  }
};

const createMyAppointment = async (req: Request, res: Response) => {
  try {
    const existingAppointment = await Appointment.findOne({ user: req.userId });

    if (existingAppointment) {
      return res
        .status(409)
        .json({ message: "User appointment already exists" });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const appointment = new Appointment(req.body);
    appointment.imageUrl = imageUrl;
    appointment.user = new mongoose.Types.ObjectId(req.userId);
    appointment.lastUpdated = new Date();
    await appointment.save();

    res.status(201).send(appointment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateMyAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findOne({
      user: req.userId,
    });

    if (!appointment) {
      return res.status(404).json({ message: "restaurant not found" });
    } 

   appointment.appointmentName = req.body.appointmentName;
   appointment.city = req.body.city;
   appointment.country = req.body.country;
   appointment.appointmentFee = req.body.appointmentFee;
   appointment.appointmentTime = req.body.appointmentTime;
   appointment.specializations = req.body.Specializations;
   appointment.specialityItems = req.body.specialityItemsItems;
   appointment.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
     appointment.imageUrl = imageUrl;
    }

    await appointment.save();
    res.status(200).send(appointment);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyAppointmentBookings = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findOne({ user: req.userId });
    if (!appointment) {
      return res.status(404).json({ message: "appointment not found" });
    }

    const bookings = await Booking.find({appointment:appointment._id })
      .populate("appointment")
      .populate("user");

    res.json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "booking not found" });
    }

    const appointment = await Appointment.findById(booking.appointment);

    if (appointment?.user?._id.toString() !== req.userId) {
      return res.status(401).send();
    }

    booking.status = status;
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "unable to update booking status" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  updateBookingStatus,
  getMyAppointmentBookings,
  getMyAppointment,
  createMyAppointment,
  updateMyAppointment,
};
