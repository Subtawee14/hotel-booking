import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import HotelController from '@/controllers/hotel.controller';
import authMiddleware from '@/middlewares/auth.middleware';

class HotelRoute implements Routes {
  public path = '/hotels';
  public router = Router();
  public hotelController = new HotelController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.hotelController.getHotels);
    this.router.get(`${this.path}/:id`, authMiddleware, this.hotelController.getHotel);
  }
}

export default HotelRoute;
