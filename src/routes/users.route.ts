import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
import roleAuthorize from '@/middlewares/roleAuthorize.middleware';
import { Role } from '@/models/contants/role.enum';

class UsersRoute implements Routes {
  public path = '/users';
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, roleAuthorize([Role.ADMIN]), this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, authMiddleware, this.usersController.getUser);
    this.router.post(`${this.path}`, authMiddleware, validationMiddleware(CreateUserDto, 'body'), this.usersController.createUser);
    this.router.put(`${this.path}/:id`, authMiddleware, validationMiddleware(CreateUserDto, 'body', true), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id`, authMiddleware, roleAuthorize([Role.ADMIN]), this.usersController.deleteUser);
  }
}

export default UsersRoute;
