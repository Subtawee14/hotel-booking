import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';
import { Role } from '@models/contants/role.enum';

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [Role.USER, Role.ADMIN],
      default: 'USER',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const userModel = model<User & Document>('User', userSchema);

export default userModel;
