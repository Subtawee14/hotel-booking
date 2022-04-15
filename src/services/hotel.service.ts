import { HttpException } from '@/exceptions/HttpException';
import { Hotel } from '@/interfaces/hotels.interface';
import hotelModel from '@/models/hotels.model';
import { isEmpty } from 'class-validator';

class HotelService {
  public hotels = hotelModel;

  public async getHotels(): Promise<Hotel[]> {
    const hotels: Hotel[] = await this.hotels.find();
    return hotels;
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
