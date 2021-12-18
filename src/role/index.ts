import { Request, Response } from 'express';
import { Controller, handleError, param as getParam } from 'express-ext';
import { Attribute, Attributes } from 'onecore';
import { buildMap, buildToDelete, buildToInsert, buildToInsertBatch, buildToUpdate, keys, Model, SearchResult, select, Service, Statement, StringMap } from 'query-core';
import { Role, RoleFilter, roleModel, RoleService } from './role';

export * from './role';

export class RoleController extends Controller<Role, string, RoleFilter> {
  constructor(log: (msg: any, ctx?: any) => void, private roleService: RoleService) {
    super(log, roleService);
    this.all = this.all.bind(this);
    this.assign = this.assign.bind(this);
  }

  all(req: Request, res: Response) {
    if (this.roleService.all) {
      this.roleService.all()
        .then(roles => res.status(200).json(roles))
        .catch(err => handleError(err, res, this.log));
    } else {
      res.status(405).end('Method Not Allowed');
    }
  }
  assign(req: Request, res: Response) {
    const id = getParam(req, res, 'id');
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

interface UserRole {
  userId?: string;
  roleId?: string;
}
const userRoleModel: Model = {
  name: 'userRole',
  source: 'userRoles',
  attributes: {
    userId: {
      key: true
    },
    roleId: {
      key: true
    },
  }
};
const roleModuleModel: Model = {
  name: 'userRole',
  source: 'userRoles',
  attributes: {
    roleId: {
      key: true
    },
    moduleId: {
      key: true
    },
    permissions: {
      type: 'number'
    }
  }
};
interface Module {
  moduleId?: string;
  roleId?: string;
  permissions?: number;
}
export class SqlRoleService extends Service<Role, string, RoleFilter> {
  private roleModuleMap: StringMap;
  constructor(
    protected find: (s: RoleFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<Role>>,
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    public exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch: (statements: Statement[]) => Promise<number>
  ) {
    super(find, 'users', query, exec, roleModel.attributes, param);
    this.metadata = this.metadata.bind(this);
    this.search = this.search.bind(this);
    this.all = this.all.bind(this);
    this.load = this.load.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.map = buildMap(roleModel.attributes);
    this.roleModuleMap = buildMap(roleModuleModel.attributes);
  }
  metadata(): Attributes {
    return roleModel.attributes;
  }
  search(s: RoleFilter, limit?: number, offset?: number | string, fields?: string[]): Promise<SearchResult<Role>> {
    return this.find(s, limit, offset, fields);
  }
  all(): Promise<Role[]> {
    return this.query<Role>('select * from roles order by roleId asc', undefined, this.map);
  }
  load(id: string): Promise<Role | null> {
    const stmt = select(id, 'roles', this.primaryKeys, this.param);
    if (!stmt) {
      return Promise.resolve(null);
    }
    return this.query<Role>(stmt.query, stmt.params, this.map)
      .then(roles => {
        if (!roles || roles.length === 0) {
          return null;
        }
        const role = roles[0];
        const q = `select moduleId, permissions from roleModules where roleId = ${this.param(1)}`;
        return this.query<Module>(q, [role.roleId], this.roleModuleMap).then(modules => {
          if (modules && modules.length > 0) {
            role.privileges = modules.map(i => (i.permissions ? i.moduleId + ' ' + i.permissions.toString(16) : i.moduleId)) as any;
          }
          return role;
        });
      });
  }
  insert(role: Role): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToInsert(role, 'roles', roleModel.attributes, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    stmts.push(stmt);
    insertRoleModules(stmts, role.roleId, role.privileges, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  update(role: Role): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToUpdate(role, 'roles', roleModel.attributes, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    stmts.push(stmt);
    const query = `delete from roleModules where roleId = ${this.param(1)}`;
    stmts.push({ query, params: [role.roleId] });
    insertRoleModules(stmts, role.roleId, role.privileges, this.param);
    return this.execBatch(stmts);
  }
  patch(role: Role): Promise<number> {
    return this.update(role);
  }
  delete(id: string): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToDelete(id, 'roles', this.primaryKeys, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    stmts.push(stmt);
    const query = `delete from roleModules where userId = ${this.param(1)}`;
    stmts.push({ query, params: [id] });
    return this.execBatch(stmts);
  }
  assign(roleId: string, users: string[]): Promise<number> {
    const userRoles: UserRole[] = users.map<UserRole>(u => {
      return { roleId, userId: u };
    });
    const stmts: Statement[] = [];
    const q1 = `delete from userRoles where roleId = ${this.param(1)}`;
    stmts.push({ query: q1, params: [roleId] });
    const s = buildToInsertBatch<UserRole>(userRoles, 'userRoles', userRoleModel.attributes, this.param);
    if (s) {
      stmts.push(s);
    }
    return this.execBatch(stmts);
  }
}
function insertRoleModules(stmts: Statement[], roleId: string, privileges: string[] | undefined, param: (i: number) => string): Statement[] {
  if (privileges && privileges.length > 0) {
    let permissions = 0;
    const modules = privileges.map<Module>(i => {
      if (i.indexOf(' ') > 0) {
        const s = i.split(' ');
        permissions = parseInt(s[1], 16);
        if (isNaN(permissions)) {
          permissions = 0;
        }
      }
      const ms: Module = { roleId, moduleId: i, permissions };
      return ms;
    });
    const stmt = buildToInsertBatch(modules, 'roleModules', roleModuleModel.attributes, param);
    if (stmt) {
      stmts.push(stmt);
    }
  }
  return stmts;
}
