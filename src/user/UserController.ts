import {GenericSearchHandler, SearchResult} from 'express-ext';
import {User} from './User';
import {UserService} from './UserService';
import {UserSM} from './UserSM';

export class UserController extends GenericSearchHandler<User, string, UserSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: UserSM, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<User>>, private userService: UserService) {
    super(log, search, userService);
  }
}
