import { CreateBookingDto } from '@/dtos/booking.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Hotel } from '@/interfaces/hotels.interface';
import { User } from '@/interfaces/users.interface';
import bookingModel from '@/models/bookings.model';
import { Types } from 'mongoose';

class BookingService {
  public bookings = bookingModel;

  public getBookings() {
    return this.bookings.find().populate({
      path: 'hotel',
      select: 'name address tel',
    });
  }

  public getBookingsByUser(user: User) {
    return this.bookings.find({ user: user }).populate({
      path: 'hotel',
      select: 'name address tel',
    });
  }

  public getBookingsByHotel(hotel: Hotel) {
    return this.bookings.find({ hotel: hotel }).populate({
      path: 'hotel',
      select: 'name address tel',
    });
  }

  public getBooking(id: string) {
    return this.bookings.findById(id).populate({
      path: 'hotel',
      select: 'name address tel',
    });
  }

  public createBooking(createBookingData: CreateBookingDto) {
    //TODO validate date
    this.validateBookingDate(createBookingData.checkIn, createBookingData.checkOut);

    return this.bookings.create({ ...createBookingData, hotel: createBookingData.hotelId });
  }

  public async updateBooking(bookingId: string, bookingData: CreateBookingDto) {
    this.validateBookingDate(bookingData.checkIn, bookingData.checkOut);

    return this.bookings.findOneAndUpdate(
      { _id: bookingId },
      {
        $set: {
          checkIn: new Date(bookingData.checkIn),
          checkOut: new Date(bookingData.checkOut),
          hotel: Types.ObjectId(bookingData.hotelId),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  public deleteBooking(bookingId: string) {
    return this.bookings.findByIdAndDelete(bookingId).populate({
      path: 'hotel',
      select: 'name address tel',
    });
  }

  private validateBookingDate(checkIn: string, checkOut: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const currentDate = new Date();
    const oneDayMillisec = 24 * 60 * 60 * 1000;
    const numOfBookingDays = (checkOutDate.getTime() - checkInDate.getTime()) / oneDayMillisec;

    if (checkInDate.getTime() < currentDate.getTime()) throw new HttpException(400, 'Check-in time must be equal or greater than current time');
    if (checkInDate.getTime() >= checkOutDate.getTime()) throw new HttpException(400, 'Check-out date must be grater than Check-in date');
    if (numOfBookingDays >= 4) throw new HttpException(400, 'You cannot book more than 3 nights');
  }
}

export default BookingService;
