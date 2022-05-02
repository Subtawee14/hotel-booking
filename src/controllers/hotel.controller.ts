import { Hotel } from '@/interfaces/hotels.interface';
import HotelService from '@/services/hotel.service';
import { NextFunction, Request, Response } from 'express';

class HotelController {
  public hotelService = new HotelService();

  public getHotels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.hotelService.getHotels(req);

      res.send({
        data: data,
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

  public createHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotel: Hotel = await this.hotelService.createHotel({ ...req.body });

      res.send({
        data: hotel,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public updateHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotel: Hotel = await this.hotelService.updateHotel(req.params.id, { ...req.body });

      res.send({
        data: hotel,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotel: Hotel = await this.hotelService.deleteHotel(req.params.id);

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
