import { Hotel } from '@/interfaces/hotels.interface';
import HotelService from '@/services/hotel.service';
import { NextFunction, Request, Response } from 'express';

class HotelController {
  public hotelService = new HotelService();

  public getHotels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hotels: Hotel[] = await this.hotelService.getHotels();
      res.send({
        data: hotels,
        message: 'success',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default HotelController;
