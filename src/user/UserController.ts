import {Request, Response} from 'express';
import {GenericSearchHandler, handleError, queryParam, SearchResult} from 'express-ext';
import {User} from './User';
import {UserService} from './UserService';
import {UserSM} from './UserSM';

export class UserController extends GenericSearchHandler<User, string, UserSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: UserSM, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<User>>, private userService: UserService) {
    super(log, search, userService);
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
      this.userService.all()
      .then(users => res.status(200).json(users))
      .catch(err => handleError(err, res, this.log));
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
