import { Request, Response } from "express";
import Appointment from "../models/appointment";

const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.restaurantId;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};

const searchAppointment = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedSpecializations = (req.query.selectedSpecializations as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query["city"] = new RegExp(city, "i");
    const cityCheck = await Appointment.countDocuments(query);
    if (cityCheck === 0) {
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedSpecializations) {
      const specializationsArray = selectedSpecializations
        .split(",")
        .map((specialization) => new RegExp(specialization, "i"));

      query["specializations"] = { $all: specializationsArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      query["$or"] = [
        { appointmentName: searchRegex },
        { specializations: { $in: [searchRegex] }},
      ];
    }

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // sortOption = "lastUpdated"
    const appointments = await Appointment.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Appointment.countDocuments(query);
    const response = {
      data: appointments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getAppointment,
  searchAppointment,
};
