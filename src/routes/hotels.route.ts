import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import HotelController from '@/controllers/hotel.controller';
import authMiddleware from '@/middlewares/auth.middleware';
import roleAuthorize from '@/middlewares/roleAuthorize.middleware';
import { Role } from '@/models/contants/role.enum';
import validationMiddleware from '@/middlewares/validation.middleware';
import { CreateHotelDto } from '@/dtos/hotel.dto';

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
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleAuthorize([Role.ADMIN]),
      validationMiddleware(CreateHotelDto, 'body'),
      this.hotelController.createHotel,
    );
    this.router.put(
      `${this.path}/:id`,
      authMiddleware,
      roleAuthorize([Role.ADMIN]),
      validationMiddleware(CreateHotelDto, 'body', true),
      this.hotelController.updateHotel,
    );
    this.router.delete(`${this.path}/:id`, authMiddleware, roleAuthorize([Role.ADMIN]), this.hotelController.deleteHotel);
  }
}

export default HotelRoute;
