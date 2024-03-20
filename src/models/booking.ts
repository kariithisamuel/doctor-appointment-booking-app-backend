import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointmentDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    city: { type: String, required: true },
  },
  cartItems: [
    {
      specialityItemId: { type: String, required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["requested", "confirmed", "inProgress", "completed", "cancelled"],
  },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
