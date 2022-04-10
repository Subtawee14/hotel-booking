import { Hotel } from '@/interfaces/hotels.interface';
import { model, Schema, Document } from 'mongoose';

const hotelSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
    },
    bookings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const hotelModel = model<Hotel & Document>('Hotel', hotelSchema);

export default hotelModel;
