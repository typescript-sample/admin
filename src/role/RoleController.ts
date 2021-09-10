import { Request, Response } from 'express';
import { Config, GenericSearchHandler, handleError, SearchResult } from 'express-ext';
import { Role } from './Role';
import { RoleService } from './RoleService';
import { RoleSM } from 'onecore';
export class RoleController extends GenericSearchHandler<Role, string, RoleSM> {
  constructor(log: (msg: string, ctx?: any) => void, search: (s: RoleSM, limit?: number, skip?: number | string, fields?: string[]) => Promise<SearchResult<Role>>, private roleService: RoleService, config: Config) {
    super(log, search, roleService, config);
    this.all = this.all.bind(this);
  }

  all(req: Request, res: Response) {
    this.roleService.all()
      .then(roles => res.status(200).json(roles))
      .catch(err => handleError(err, res, this.log));
  }
}
