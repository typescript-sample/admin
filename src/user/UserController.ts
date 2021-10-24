import { Request, Response } from 'express';
import { Controller, handleError, queryParam } from 'express-ext';
import { User } from './User';
import { UserFilter } from './UserFilter';
import { UserService } from './UserService';

export class UserController extends Controller<User, string, UserFilter> {
  constructor(log: (msg: any, ctx?: any) => void, private userService: UserService) {
    super(log, userService);
    this.all = this.all.bind(this);
    this.getUsersOfRole = this.getUsersOfRole.bind(this);
  }

  all(req: Request, res: Response) {
    const v = req.query['roleId'];
    if (v && v.toString().length > 0) {
      this.userService.getUsersOfRole(v.toString())
        .then(users => res.status(200).json(users))
        .catch(err => handleError(err, res, this.log));
    } else {
      if (this.userService.all) {
        this.userService.all()
          .then(users => res.status(200).json(users))
          .catch(err => handleError(err, res, this.log));
      } else {
        res.status(400).end('roleId is required');
      }
    }
  }
  getUsersOfRole(req: Request, res: Response) {
    const id = queryParam(req, res, 'roleId');
    if (id) {
      this.userService.getUsersOfRole(id)
        .then(users => res.status(200).json(users))
        .catch(err => handleError(err, res, this.log));
    }
  }
}
