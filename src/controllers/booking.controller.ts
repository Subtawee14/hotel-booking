import { CreateBookingDto } from '@/dtos/booking.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Booking } from '@/interfaces/bookings.interface';
import { Role } from '@/models/contants/role.enum';
import BookingService from '@/services/booking.service';
import HotelService from '@/services/hotel.service';
import UserService from '@/services/users.service';
import { Request, Response, NextFunction } from 'express';

class BookingController {
  public bookingService = new BookingService();
  public hotelService = new HotelService();
  public userService = new UserService();

  public getBookings = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let query;

    try {
      if (req.user.role !== Role.ADMIN) {
        query = this.bookingService.getBookingsByUser(req.user);
      } else {
        if (req.params.hotelId) {
          const hotel = await this.hotelService.getHotel(req.params.hotalId);
          query = this.bookingService.getBookingsByHotel(hotel);
        } else {
          query = this.bookingService.getBookings();
        }
      }

      const bookings: Booking[] = await query;
      res.send({
        data: bookings,
        message: 'get bookings success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.getBooking(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `No Booking with the id of ${req.params.id}`,
        });
      }

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
      const hotel = await this.hotelService.getHotel(req.body.hotelId);
      if (!hotel) {
        return res.status(400).json({
          success: false,
          message: `No hotel with the id of ${req.body.hotelId}`,
        });
      }

      const booking: Booking = await this.bookingService.createBooking({ user: req.user, ...req.body });
      await this.userService.addUserBookings(req.user._id, booking._id);
      await this.hotelService.addHotelBookings(req.body.hotelId, booking._id);

      res.send({
        data: booking,
        message: 'create booking success',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const bookingId: string = req.params.id;
    const bookingData: CreateBookingDto = req.body;

    try {
      const booking: Booking = await this.bookingService.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({
          data: {},
          message: `No Booking with the id of ${bookingId}`,
        });
      }

      if (booking.user.toString() !== req.user._id && req.user.role !== Role.ADMIN) {
        return res.status(401).json({
          data: {},
          message: `User ${req.user._id} is not authorized to delete this booking`,
        });
      }

      const updatedBooking: Booking = await this.bookingService.updateBooking(bookingId, bookingData);
      res.send({
        data: updatedBooking,
        message: 'update booking success',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const bookingId: string = req.params.id;

    try {
      const booking: Booking = await this.bookingService.getBooking(bookingId);

      if (!booking) {
        return res.status(404).json({
          data: {},
          message: `No Booking with the id of ${bookingId}`,
        });
      }

      if (booking.user._id.toString() !== req.user._id && req.user.role !== Role.ADMIN) {
        return res.status(401).json({
          data: {},
          message: `User ${req.user._id} is not authorized to delete this booking`,
        });
      }

      const deletedBooking: Booking = await this.bookingService.deleteBooking(bookingId);
      await this.userService.removeUserBookings(req.user._id, booking._id);
      await this.hotelService.removeHotelBookings(booking.hotel._id, booking._id);
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
