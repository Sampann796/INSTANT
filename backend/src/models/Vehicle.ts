import { Schema, model, Types } from "mongoose";

export type FuelType =
  | "petrol"
  | "diesel"
  | "cng"
  | "electric"
  | "hybrid";

export interface IVehicle {
  customerId: Types.ObjectId;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    make: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric", "hybrid"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);