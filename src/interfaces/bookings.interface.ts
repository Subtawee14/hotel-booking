import { Hotel } from './hotels.interface';
import { User } from './users.interface';

export interface Booking {
  _id: string;
  hotel: Hotel;
  user: User;
  checkIn: Date;
  checkOut: Date;
}
