import {Request, Response} from 'express';
import {GenericSearchHandler, handleError, SearchResult} from 'express-ext';
import {Role} from './Role';
import {RoleService} from './RoleService';
import {RoleSM} from './RoleSM';

export class RoleController extends GenericSearchHandler<Role, string, RoleSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: RoleSM, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<Role>>, private roleService: RoleService) {
    super(log, search, roleService);
    this.all = this.all.bind(this);
  }

  all(req: Request, res: Response) {
    this.roleService.all()
      .then(users => res.status(200).json(users))
      .catch(err => handleError(err, res, this.log));
  }
}
