import { HttpException } from '@/exceptions/HttpException';
import { Request } from 'express';
import { Hotel } from '@/interfaces/hotels.interface';
import hotelModel from '@/models/hotels.model';
import { isEmpty } from 'class-validator';

class HotelService {
  public hotels = hotelModel;

  public async getHotels(req: Request) {
    let query;

    const reqQuery = { ...req.query };

    //Fields to exculde
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = this.hotels.find(JSON.parse(queryStr));

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

    const total = await this.hotels.countDocuments();

    query = query.skip(startIndex).limit(limit);
    const hotels: Hotel[] = await query;

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

    const data = {
      hotels: hotels,
      count: hotels.length,
      total: total,
      pagination,
    };
    return data;
  }

  public async getHotel(hotelId: string): Promise<Hotel> {
    if (isEmpty(hotelId)) throw new HttpException(400, 'Please add valid hotel id');

    const hotel: Hotel = await this.hotels.findById(hotelId);
    if (!hotel) throw new HttpException(409, "this hotel is doesn't exist");
    return hotel;
  }

  public async addHotelBookings(hotelId: string, bookingId: string) {
    if (isEmpty(hotelId)) throw new HttpException(400, 'Please add valid hotel id');

    const findHotel = await this.hotels.findById(hotelId);
    if (!findHotel) throw new HttpException(409, "this hotel is doesn't exist");

    findHotel.bookings = [...findHotel.bookings, bookingId];
    findHotel.save();

    return findHotel;
  }

  public async removeHotelBookings(hotelId: string, bookingId: string) {
    if (isEmpty(hotelId)) throw new HttpException(400, 'Please add valid hotel id');

    const findHotel = await this.hotels.findById(hotelId);
    if (!findHotel) throw new HttpException(409, "this hotel is doesn't exist");

    findHotel.bookings = [...findHotel.bookings].filter(function (elem) {
      return elem !== bookingId;
    });
    findHotel.save();

    return findHotel;
  }
}

export default HotelService;
