import { Request, Response } from 'express';
import { Config, GenericSearchHandler, handleError, SearchResult } from 'express-ext';
import { UserSM } from 'onecore';
import { User } from './User';
import { UserService } from './UserService';

export class UserController extends GenericSearchHandler<User, number, UserSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: UserSM, limit?: number, skip?: number | string, fields?: string[]) => Promise<SearchResult<User>>, private userService: UserService, config: Config) {
    super(log, search, userService, config);
    this.all = this.all.bind(this);
  }

  all(req: Request, res: Response) {
    this.userService.all()
      .then(users => res.status(200).json(users))
      .catch(err => handleError(err, res, this.log));
  }
}
