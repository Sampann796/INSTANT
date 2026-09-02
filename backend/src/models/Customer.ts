import { Schema, model, Document } from "mongoose";

export type CustomerStatus = "active" | "inactive";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpending: number;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpending: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });

export const Customer = model<ICustomer>("Customer", customerSchema);