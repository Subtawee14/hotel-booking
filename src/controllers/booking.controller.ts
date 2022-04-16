import { CreateBookingDto } from '@/dtos/booking.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Booking } from '@/interfaces/bookings.interface';
import { Role } from '@/models/contants/role.enum';
import BookingService from '@/services/booking.service';
import HotelService from '@/services/hotel.service';
import UserService from '@/services/users.service';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

class BookingController {
  public bookingService = new BookingService();
  public hotelService = new HotelService();
  public userService = new UserService();

  public getBookings = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    let query;
    let totalQuery;

    const reqQuery = { ...req.query };

    //Fields to exculde
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = this.bookingService.getBookingsWithQuery(queryStr);
    totalQuery = this.bookingService.getNumberOfBookings(queryStr);

    //Check Role
    if (req.user.role !== Role.ADMIN) {
      query = query.where('user').equals(Types.ObjectId(req.user._id));
      totalQuery = totalQuery.where('user').equals(Types.ObjectId(req.user._id));
    }

    //Select field
    if (req.query.select) {
      const fieldsQuery = req.query.select as string;
      const fields = fieldsQuery.split(',').join(' ');
      query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
      const sortQuery = req.query.sort as string;
      const sortBy = sortQuery.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
      const total = await totalQuery;

      query = query.skip(startIndex).limit(limit);
      const bookings: Booking[] = await query;

      //Pagination result
      type Page = { page: number; limit: number };
      type Pagination = { next: Page; prev: Page; current: Page };
      const pagination = {} as Pagination;

      pagination.current = {
        page: page,
        limit,
      };

      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }

      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }

      res.send({
        data: bookings,
        count: bookings.length,
        total,
        pagination,
        message: 'get bookings success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getBooking = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const booking: Booking = await this.bookingService.getBooking(req.params.id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: `No Booking with the id of ${req.params.id}`,
        });
      }

      if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
        return res.status(401).json({
          data: {},
          message: `User ${req.user._id} is not authorized to see this booking`,
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

      if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
        return res.status(401).json({
          data: {},
          message: `User ${req.user._id} is not authorized to update this booking`,
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

      if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
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
