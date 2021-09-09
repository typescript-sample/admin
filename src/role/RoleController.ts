import {Request, Response} from 'express';
import {GenericSearchHandler, handleError, param, SearchResult} from 'express-ext';
import {Role} from './Role';
import {RoleService} from './RoleService';
import {RoleSM} from './RoleSM';

export class RoleController extends GenericSearchHandler<Role, string, RoleSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: RoleSM, limit?: number, skip?: number|string, fields?: string[]) => Promise<SearchResult<Role>>, private roleService: RoleService) {
    super(log, search, roleService);
    this.all = this.all.bind(this);
    this.assign = this.assign.bind(this);
  }

  all(req: Request, res: Response) {
    this.roleService.all()
      .then(roles => res.status(200).json(roles))
      .catch(err => handleError(err, res, this.log));
  }
  assign(req: Request, res: Response) {
    const id = param(req, res, 'id');
    if (id) {
      const users: string[] = req.body;
      if (!Array.isArray(users)) {
        res.status(400).end(`'Body must be an array`);
      } else {
        this.roleService.assign(id, users)
          .then(r => res.status(200).json(r))
          .catch(err => handleError(err, res, this.log));
      }
    }
  }
}
