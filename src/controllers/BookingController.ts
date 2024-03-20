import Stripe from "stripe";
import { Request, Response } from "express";
import Appointment, {SpecialityItemType} from "../models/appointment";
import Booking from "../models/booking";


const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate("appointment")
      .populate("user");

    res.json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

type CheckoutSessionRequest = {
  cartItems: {
    specialityItemId: string;
    name: string;
    quantity: string;
  }[];
  appointmentDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  appointmentId: string;
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const booking = await Booking.findById(event.data.object.metadata?.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.totalAmount = event.data.object.amount_total;
    booking.status = "confirmed";

    await booking.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const appointment = await Appointment.findById(
      checkoutSessionRequest.appointmentId
    );

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const newBooking = new Booking({
      appointment: appointment,
      user: req.userId,
      status: "placed",
      appointmentDetails: checkoutSessionRequest.appointmentDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      appointment.specialityItems
    );

    const session = await createSession(
      lineItems,
      newBooking._id.toString(),
      appointment.appointmentFee,
      appointment._id.toString()
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    await newBooking.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  specialityItems: SpecialityItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const specialityItem = specialityItems.find(
      (item) => item._id.toString() === cartItem.specialityItemId.toString()
    );

    if (!specialityItem) {
      throw new Error(`Speciality item not found: ${cartItem.specialityItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "gbp",
        unit_amount: specialityItem.price,
        product_data: {
          name: specialityItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  bookingId: string,
  appointmentFee: number,
  appointmentId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Appointment",
          type: "fixed_amount",
          fixed_amount: {
            amount: appointmentFee,
            currency: "gbp",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      bookingId,
      appointmentId,
    },
    success_url: `${FRONTEND_URL}/booking-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${appointmentId}?cancelled=true`,
  });

  return sessionData;
};

export default {
  getMyBookings,
  createCheckoutSession,
  stripeWebhookHandler,
};
