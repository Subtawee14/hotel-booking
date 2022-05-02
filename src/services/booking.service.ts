import { HttpException } from '@/exceptions/HttpException';
import { Role } from '@/models/contants/role.enum';
import { Booking } from '@/interfaces/bookings.interface';
import bookingModel from '@/models/bookings.model';
import { Types } from 'mongoose';
import HotelService from './hotel.service';
import UserService from './users.service';
import { Pagination } from '@/interfaces/pagination.interface';
import { User } from '@/interfaces/users.interface';
import { CreateBookingDto } from '@/dtos/booking.dto';

class BookingService {
  public bookings = bookingModel;
  public hotelService = new HotelService();
  public userService = new UserService();

  public async getBookings(reqQuery: any, user: User) {
    let query;
    let totalQuery;

    const reqQueryForFind = { ...reqQuery };

    //Fields to exculde
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQueryForFind[param]);

    let queryStr = JSON.stringify(reqQueryForFind);
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
    if (user.role !== Role.ADMIN) {
      query = query.where('user').equals(Types.ObjectId(user._id));
      totalQuery = totalQuery.where('user').equals(Types.ObjectId(user._id));
    }

    //Select field
    if (reqQuery.select) {
      const fieldsQuery = reqQuery.select as string;
      const fields = fieldsQuery.split(',').join(' ');
      query = query.select(fields);
    }

    //Sort
    if (reqQuery.sort) {
      const sortQuery = reqQuery.sort as string;
      const sortBy = sortQuery.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //Pagination
    const page = parseInt(reqQuery.page as string, 10) || 1;
    const limit = parseInt(reqQuery.limit as string, 10) || 25;
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

  public async getBooking(bookingId: string, user: User) {
    const booking = await this.bookings
      .findById(bookingId)
      .populate({
        path: 'hotel',
        select: 'name address tel',
      })
      .populate({
        path: 'user',
        select: 'name role email tel',
      });

    if (!booking) throw new HttpException(400, `No Booking with the id of ${bookingId}`);
    if (booking.user._id.toString() !== user._id.toString() && user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${user._id} is not authorized to see this booking`);
    }

    return booking;
  }

  public async createBooking(createBookingData: CreateBookingDto, user: User) {
    this.validateBookingDate(createBookingData.checkIn, createBookingData.checkOut);

    const hotel = await this.hotelService.getHotel(createBookingData.hotelId);
    if (!hotel) throw new HttpException(400, `No hotel with the id of ${createBookingData.hotelId}`);

    const booking = await this.bookings.create({ user: user._id, hotel: createBookingData.hotelId, ...createBookingData });
    await this.userService.addUserBookings(user._id, booking._id);
    await this.hotelService.addHotelBookings(createBookingData.hotelId, booking._id);

    return booking;
  }

  public async updateBooking(bookingId: string, updateBookingData: CreateBookingDto, user: User) {
    this.validateBookingDate(updateBookingData.checkIn, updateBookingData.checkOut);

    const booking = await this.bookings.findById(bookingId);
    if (!booking) throw new HttpException(400, `No Booking with the id of ${bookingId}`);

    if (booking.user._id.toString() !== user._id.toString() && user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${user._id} is not authorized to update this booking`);
    }

    const updateBookingDataStr = JSON.stringify(updateBookingData);
    const updatedBooking = await this.bookings
      .findByIdAndUpdate(bookingId, JSON.parse(updateBookingDataStr), {
        new: true,
        runValidators: true,
      })
      .populate({
        path: 'hotel',
        select: 'name address tel',
      })
      .populate({
        path: 'user',
        select: 'name role email tel',
      });

    return updatedBooking;
  }

  public async deleteBooking(bookingId: string, user: User) {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) throw new HttpException(400, `No Booking with the id of ${bookingId}`);

    if (booking.user._id.toString() !== user._id.toString() && user.role !== Role.ADMIN) {
      throw new HttpException(401, `User ${user._id} is not authorized to delete this booking`);
    }

    await this.userService.removeUserBookings(user._id, booking._id);
    await this.hotelService.removeHotelBookings(booking.hotel._id, booking._id);
    const deletedBooking = await this.bookings
      .findByIdAndDelete(bookingId)
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
