import { Schema, model, Document, Types } from "mongoose";

export type MechanicStatus =
  | "available"
  | "assigned"
  | "on_the_way"
  | "busy"
  | "offline";

export interface IMechanic extends Document {
  name: string;
  phone: string;
  email: string;
  status: MechanicStatus;
  jobsCompleted: number;
  currentBookingId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const mechanicSchema = new Schema<IMechanic>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
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

    status: {
      type: String,
      enum: [
        "available",
        "assigned",
        "on_the_way",
        "busy",
        "offline",
      ],
      default: "available",
    },

    jobsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentBookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

mechanicSchema.index({ name: 1 });

export const Mechanic = model<IMechanic>("Mechanic", mechanicSchema);