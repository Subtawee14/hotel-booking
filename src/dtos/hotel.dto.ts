import { IsString } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  public name: string;

  @IsString()
  public address: string;

  @IsString()
  public tel: string;
}
