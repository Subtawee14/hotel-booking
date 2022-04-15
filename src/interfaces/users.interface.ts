import { Role } from '@/models/contants/role.enum';

export interface User {
  _id: string;
  email: string;
  password: string;
  role: Role;
  tel: string;
  name: string;
  bookings: string[];
}
