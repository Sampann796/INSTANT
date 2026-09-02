import { Request, Response } from "express";
import { Service } from "../models/Service";

export const getServices = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search = "",
      category,
    } = req.query;

    const filter: any = {};

    if (search) {
      filter.name = {
        $regex: String(search),
        $options: "i",
      };
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    const services = await Service.find(filter)
      .sort({ name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error(
      "Services error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load services",
    });
  }
};


export const getServiceById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const service =
      await Service.findById(id).lean();

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(
      "Service details error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load service",
    });
  }
};