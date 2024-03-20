import express from "express";
import multer from "multer";
import MyAppointmentController from "../controllers/MyAppointmentController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyAppointmentRequest } from "../middleware/Validation";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get(
  "/booking",
  jwtCheck,
  jwtParse,
  MyAppointmentController.getMyAppointmentBookings
);

router.patch(
  "/booking/:bookingId/status",
  jwtCheck,
  jwtParse,
  MyAppointmentController.updateBookingStatus
);

router.get("/", jwtCheck, jwtParse, MyAppointmentController.getMyAppointment);

router.post(
  "/",
  upload.single("imageFile"),
  validateMyAppointmentRequest,
  jwtCheck,
  jwtParse,
  MyAppointmentController.createMyAppointment
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyAppointmentRequest,
  jwtCheck,
  jwtParse,
  MyAppointmentController.updateMyAppointment
);

export default router;
