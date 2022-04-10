import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  public hotelId: string;

  @IsString()
  @IsNotEmpty()
  public userId: string;

  public checkIn: string;
  public checkOut: string;
}
