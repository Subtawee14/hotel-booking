import { Hotel } from '@/interfaces/hotels.interface';
import hotelModel from '@/models/hotels.model';

class HotelService {
  public hotels = hotelModel;

  public async getHotels(): Promise<Hotel[]> {
    const hotels: Hotel[] = await this.hotels.find();
    return hotels;
  }
}

export default HotelService;
