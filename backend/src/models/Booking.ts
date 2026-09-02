import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface IBooking extends Document {
  bookingNumber: string;

  customerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  mechanicId?: Types.ObjectId | null;
  serviceId: Types.ObjectId;

  status: BookingStatus;

  scheduledAt: Date;

  amount: number;

  notes?: string;

  assignedAt?: Date;
  onTheWayAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },

    mechanicId: {
      type: Schema.Types.ObjectId,
      ref: "Mechanic",
      default: null,
      index: true,
    },

    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "on_the_way",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    assignedAt: Date,

    onTheWayAt: Date,

    startedAt: Date,

    completedAt: Date,

    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ status: 1, scheduledAt: -1 });
bookingSchema.index({ customerId: 1, scheduledAt: -1 });
bookingSchema.index({ mechanicId: 1, status: 1 });
bookingSchema.index({ serviceId: 1, scheduledAt: -1 });

export const Booking = model<IBooking>("Booking", bookingSchema);