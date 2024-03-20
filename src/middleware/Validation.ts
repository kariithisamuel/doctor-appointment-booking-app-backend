import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors = async (req: Request, res: Response, next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMyUserRequest = [
    body("name").isString().notEmpty().withMessage("Name must be a string"),
    body("addressLine1").isString().notEmpty().withMessage("AddressLine1 must be a string"),
    body("city").isString().notEmpty().withMessage("City must be a string"),
    body("country").isString().notEmpty().withMessage("Country must be a string"),
    handleValidationErrors,
];

export const validateMyAppointmentRequest = [
  body("appointmentName").notEmpty().withMessage("Appointment name is required"),
  body("city").notEmpty().withMessage("City is required"),
  body("country").notEmpty().withMessage("Country is required"),
  body("appointmentFee")
    .isFloat({ min: 0 })
    .withMessage("Appointment fee must be a positive number"),
  body("appointmentTime")
    .isInt({ min: 0 })
    .withMessage("Estimated delivery time must be a postivie integar"),
  body("specializations")
    .isArray()
    .withMessage("Specializations must be an array")
    .not()
    .isEmpty()
    .withMessage("Specializations array cannot be empty"),
  body("specialityItems").isArray().withMessage("Speciality items must be an array"),
  body("specialityItems.*.name").notEmpty().withMessage("Speciality item name is required"),
  body("specialityItems.*.price")
    .isFloat({ min: 0 })
    .withMessage("Speciality item price is required and must be a postive number"),
  handleValidationErrors,
];