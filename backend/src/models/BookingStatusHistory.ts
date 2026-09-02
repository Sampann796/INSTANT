import { Schema, model, Document, Types } from "mongoose";

export interface IBookingStatusHistory extends Document {
  bookingId: Types.ObjectId;
  previousStatus?: string | null;
  newStatus: string;
  changedBy?: string;
  note?: string;
  createdAt: Date;
}

const bookingStatusHistorySchema =
  new Schema<IBookingStatusHistory>(
    {
      bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true,
      },

      previousStatus: {
        type: String,
        default: null,
      },

      newStatus: {
        type: String,
        required: true,
      },

      changedBy: {
        type: String,
        trim: true,
      },

      note: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    }
  );

bookingStatusHistorySchema.index({
  bookingId: 1,
  createdAt: 1,
});

export const BookingStatusHistory = model<IBookingStatusHistory>(
  "BookingStatusHistory",
  bookingStatusHistorySchema
);