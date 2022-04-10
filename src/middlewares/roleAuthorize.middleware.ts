import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { Role } from '@/models/contants/role.enum';
import { NextFunction, Response } from 'express';

const roleAuthorize = (roles: Role[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      next(new HttpException(403, "You don't have permission to access this route"));
    }
  };
};

export default roleAuthorize;
