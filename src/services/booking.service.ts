import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Role } from '@/models/contants/role.enum';
import { Booking } from '@/interfaces/bookings.interface';
import bookingModel from '@/models/bookings.model';
import { Types } from 'mongoose';
import HotelService from './hotel.service';
import UserService from './users.service';
import { Pagination } from '@/interfaces/pagination.interface';

class BookingService {
  public bookings = bookingModel;
  public hotelService = new HotelService();
  public userService = new UserService();

  public async getBookings(req: RequestWithUser) {
    let query;
    let totalQuery;

    const reqQuery = { ...req.query };

    //Fields to exculde
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = this.bookings
      .find(JSON.parse(queryStr))
      .populate({
        path: 'hotel',
        select: 'name address tel',
      })
      .populate({
        path: 'user',
        select: 'name role email tel',
      });

    totalQuery = this.bookings.countDocuments(JSON.parse(queryStr));

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

    const total = await totalQuery;
    if (!total) throw new HttpException(400, 'Invalid Input! Please check your input data');

    query = query.skip(startIndex).limit(limit);
    const bookings: Booking[] = await query;
    if (!bookings) throw new HttpException(400, 'Invalid Input! Please check your input data');

    //Pagination result
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

    const data = {
      booking: bookings,
      count: bookings.length,
      total,
      pagination,
    };

    return data;
  }

  public async getBooking(req: RequestWithUser) {
    const booking = await this.bookings
      .findById(req.params.id)
      .populate({
        path: 'hotel',
        select: 'name address tel',
      })
      .populate({
        path: 'user',
        select: 'name role email tel',
      });

    if (!booking) throw new HttpException(400, `No Booking with the id of ${req.params.id}`);
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${req.user._id} is not authorized to see this booking`);
    }

    return booking;
  }

  public async createBooking(req: RequestWithUser) {
    this.validateBookingDate(req.body.checkIn, req.body.checkOut);

    const hotel = await this.hotelService.getHotel(req.body.hotelId);
    if (!hotel) throw new HttpException(400, `No hotel with the id of ${req.body.hotelId}`);

    const booking = await this.bookings.create({ user: req.user._id, hotel: req.body.hotelId, ...req.body });
    await this.userService.addUserBookings(req.user._id, booking._id);
    await this.hotelService.addHotelBookings(req.body.hotelId, booking._id);

    return booking;
  }

  public async updateBooking(req: RequestWithUser) {
    this.validateBookingDate(req.body.checkIn, req.body.checkOut);

    const booking = await this.bookings.findById(req.params.id);
    if (!booking) throw new HttpException(400, `No Booking with the id of ${req.params.id}`);

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${req.user._id} is not authorized to update this booking`);
    }

    const updateBookingDataStr = JSON.stringify(req.body);
    const updatedBooking = await this.bookings.findByIdAndUpdate(req.params.id, JSON.parse(updateBookingDataStr), {
      new: true,
      runValidators: true,
    });

    return updatedBooking;
  }

  public async deleteBooking(req: RequestWithUser) {
    const booking = await this.bookings.findById(req.params.id);
    if (!booking) throw new HttpException(400, `No Booking with the id of ${req.params.id}`);

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${req.user._id} is not authorized to delete this booking`);
    }

    await this.userService.removeUserBookings(req.user._id, booking._id);
    await this.hotelService.removeHotelBookings(booking.hotel._id, booking._id);
    const deletedBooking = await this.bookings
      .findByIdAndDelete(req.params.id)
      .populate({
        path: 'hotel',
        select: 'name address tel',
      })
      .populate({
        path: 'user',
        select: 'name role email tel',
      });

    return deletedBooking;
  }

  private validateBookingDate(checkIn: string, checkOut: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const currentDate = new Date();
    const oneDayMillisec = 24 * 60 * 60 * 1000;
    const numOfBookingDays = (checkOutDate.getTime() - checkInDate.getTime()) / oneDayMillisec;

    if (checkInDate.getTime() < currentDate.getTime()) throw new HttpException(400, 'Check-in time must be equal or greater than current time');
    if (checkInDate.getTime() >= checkOutDate.getTime()) throw new HttpException(400, 'Check-out date must be grater than Check-in date');
    if (numOfBookingDays >= 3) throw new HttpException(400, 'You cannot book more than 3 nights');
  }
}

export default BookingService;
