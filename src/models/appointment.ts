import mongoose, { InferSchemaType } from "mongoose";

const specialityItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type SpecialityItemType = InferSchemaType<typeof specialityItemSchema>;

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  appointmentName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  appointmentFee: { type: Number, required: true },
  appointmentTime: { type: Number, required: true },
  specializations: [{ type: String, required: true }],
  specialityItems: [specialityItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
