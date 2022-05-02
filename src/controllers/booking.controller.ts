import { RequestWithUser } from '@/interfaces/auth.interface';
import { Booking } from '@/interfaces/bookings.interface';
import BookingService from '@/services/booking.service';
import { Response, NextFunction } from 'express';

class BookingController {
  public bookingService = new BookingService();

  public getBookings = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const data = await this.bookingService.getBookings(req.query, req.user);

      res.send({
        data: data,
        message: 'get bookings success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.getBooking(req.params.id, req.user);

      res.send({
        data: booking,
        message: 'get a booking success',
      });
    } catch (error) {
      next(error);
    }
  };

  public createBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.createBooking(req.body, req.user);

      res.send({
        data: booking,
        message: 'create booking success',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const updatedBooking: Booking = await this.bookingService.updateBooking(req.params.id, req.body, req.user);

      res.send({
        data: updatedBooking,
        message: 'update booking success',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const deletedBooking: Booking = await this.bookingService.deleteBooking(req.params.id, req.user);

      res.send({
        data: deletedBooking,
        message: 'delete booking success',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default BookingController;
