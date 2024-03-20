import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import BookingController from "../controllers/BookingController";

const router = express.Router();

router.get("/", jwtCheck, jwtParse, BookingController.getMyBookings);

router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  BookingController.createCheckoutSession
);

router.post("/checkout/webhook", BookingController.stripeWebhookHandler);

export default router;
