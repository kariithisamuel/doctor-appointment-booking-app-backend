import express from "express";
import { param } from "express-validator";
import AppointmentController from "../controllers/AppointmentController";

const router = express.Router();

router.get(
  "/:appointmentId",
  param("appointmentId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("AppointmentId paramenter must be a valid string"),
  AppointmentController.getAppointment
);

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City paramenter must be a valid string"),
  AppointmentController.searchAppointment
);

export default router;
