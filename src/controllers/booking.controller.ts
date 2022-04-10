import { RequestWithUser } from '@/interfaces/auth.interface';
import { Booking } from '@/interfaces/bookings.interface';
import BookingService from '@/services/booking.service';
import { Request, Response, NextFunction } from 'express';

class BookingController {
  public bookingService = new BookingService();

  public getBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bookings: Booking[] = await this.bookingService.getBookings();
      res.send({
        data: bookings,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.getBooking(req.params.id);
      res.send({
        data: booking,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.createBooking({ user: req.user, ...req.body });
      res.send({
        data: booking,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default BookingController;
