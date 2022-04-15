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
}

export default HotelService;
