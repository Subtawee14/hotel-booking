import { Booking } from '@/interfaces/bookings.interface';
import { model, Schema, Document } from 'mongoose';

const bookingSchema: Schema = new Schema(
  {
    hotel: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const bookingModel = model<Booking & Document>('Booking', bookingSchema);

export default bookingModel;
