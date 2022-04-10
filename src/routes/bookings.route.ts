import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import BookingController from '@/controllers/booking.controller';

class BookingRoute implements Routes {
  public path = '/bookings';
  public router = Router();
  public bookingController = new BookingController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.bookingController.getBookings);
    this.router.get(`${this.path}/:id`, authMiddleware, this.bookingController.getBooking);
    this.router.post(`${this.path}`, authMiddleware, this.bookingController.createBooking);
  }
}

export default BookingRoute;
