import { CreateBookingDto } from '@/dtos/booking.dto';
import bookingModel from '@/models/bookings.model';

class BookingService {
  public bookings = bookingModel;

  public getBookings() {
    return this.bookings.find();
  }

  public getBooking(id: string) {
    return this.bookings.findById(id);
  }

  public createBooking(createBookingData: CreateBookingDto) {
    //TODO validate date
    return this.bookings.create({ ...createBookingData, hotel: createBookingData.hotelId });
  }
}

export default BookingService;
