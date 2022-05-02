import { HttpException } from '@/exceptions/HttpException';
import { Request } from 'express';
import { Hotel } from '@/interfaces/hotels.interface';
import hotelModel from '@/models/hotels.model';
import { isEmpty } from 'class-validator';
import { Pagination } from '@/interfaces/pagination.interface';
import { CreateHotelDto } from '@/dtos/hotel.dto';

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

  public async createHotel(hotelData: CreateHotelDto): Promise<Hotel> {
    if (isEmpty(hotelData)) throw new HttpException(400, 'Please add valid hotelData');

    const findHotel: Hotel = await this.hotels.findOne({ name: hotelData.name });
    if (findHotel) throw new HttpException(409, 'This hotel name is already exist');

    const createdHotel: Hotel = await this.hotels.create({ ...hotelData, booking: [] });

    return createdHotel;
  }

  public async updateHotel(hotelId: string, updateHotelData: CreateHotelDto): Promise<Hotel> {
    if (isEmpty(updateHotelData)) throw new HttpException(400, 'Please add hotel data');

    const findHotel: Hotel = await this.hotels.findOne({ name: updateHotelData.name });
    if (findHotel && findHotel._id != hotelId) throw new HttpException(409, 'This hotel name is already exist');

    const updateHotelDataStr = JSON.stringify(updateHotelData);
    const updatedHotel: Hotel = await this.hotels.findByIdAndUpdate(hotelId, JSON.parse(updateHotelDataStr), {
      new: true,
      runValidators: true,
    });
    if (!updatedHotel) throw new HttpException(409, 'This Hotel is not exist');

    return updatedHotel;
  }

  public async deleteHotel(hotelId: string): Promise<Hotel> {
    if (isEmpty(hotelId)) throw new HttpException(400, 'Please add valid hotel id');

    const deletedHotel: Hotel = await this.hotels.findByIdAndDelete(hotelId);
    if (!deletedHotel) throw new HttpException(409, "this hotel is doesn't exist");
    return deletedHotel;
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
