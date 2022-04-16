import { Hotel } from '@/interfaces/hotels.interface';
import HotelService from '@/services/hotel.service';
import { NextFunction, Request, Response } from 'express';

class HotelController {
  public hotelService = new HotelService();

  public getHotels = async (req: Request, res: Response, next: NextFunction) => {
    let query;

    const reqQuery = { ...req.query };

    //Fields to exculde
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = this.hotelService.getHotelsWithQuery(queryStr);

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
      const total = await this.hotelService.getNumberOfHotels();

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

      res.send({
        data: hotels,
        count: hotels.length,
        total,
        pagination,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public getHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotel: Hotel = await this.hotelService.getHotel(req.params.id);
      res.send({
        data: hotel,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default HotelController;
