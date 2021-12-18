import { Request, Response } from 'express';
import { Controller, handleError, queryParam } from 'express-ext';
import { Attribute, buildMap, buildToDelete, buildToInsert, buildToInsertBatch, buildToUpdate, Model, SearchResult, select, Service, Statement, StringMap } from 'query-core';
import { User, UserFilter, userModel, UserService } from './user';

export * from './user';

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
interface UserRole {
  userId?: string;
  roleId?: string;
}
export class SqlUserService extends Service<User, string, UserFilter> implements UserService {
  constructor(
    protected find: (s: UserFilter, limit?: number, offset?: number | string, fields?: string[]) => Promise<SearchResult<User>>,
    public param: (i: number) => string,
    query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch: (statements: Statement[]) => Promise<number>
  ) {
    super(find, 'users', query, exec, userModel.attributes, param);
    this.search = this.search.bind(this);
    this.all = this.all.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.map = buildMap(userModel.attributes);
  }
  getUsersOfRole(roleId: string): Promise<User[]> {
    if (!roleId || roleId.length === 0) {
      return Promise.resolve([]);
    }
    const q = `
      select u.*
      from userRoles ur
        inner join users u on u.userId = ur.userId
      where ur.roleId = ${this.param(1)}
      order by userId`;
    return this.query(q, [roleId], this.map);
  }
  search(s: UserFilter, limit?: number, offset?: number | string, fields?: string[]): Promise<SearchResult<User>> {
    return this.find(s, limit, offset, fields);
  }
  all(): Promise<User[]> {
    return this.query('select * from users order by userId asc', undefined, this.map);
  }
  load(id: string): Promise<User | null> {
    const stmt = select(id, 'users', this.primaryKeys, this.param);
    if (!stmt) {
      return Promise.resolve(null);
    }
    return this.query(stmt.query, stmt.params, this.map)
      .then(users => {
        if (!users || users.length === 0) {
          return null;
        }
        const user = users[0];
        const q = `select roleId as id from userRoles where userId = ${this.param(1)}`;
        return this.query(q, [user.userId]).then(roles => {
          if (roles && roles.length > 0) {
            user.roles = roles.map(i => (i as any)['id']);
          }
          return user;
        });
      });
  }
  insert(user: User): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToInsert(user, 'users', userModel.attributes, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    stmts.push(stmt);
    insertUserRoles(stmts, user.userId, user.roles, this.param);
    return this.execBatch(stmts);
  }
  update(user: User): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToUpdate(user, 'users', userModel.attributes, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    const query = `delete from userRoles where userId = ${this.param(1)}`;
    stmts.push({ query, params: [user.userId] });
    insertUserRoles(stmts, user.userId, user.roles, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  patch(user: User): Promise<number> {
    return this.update(user);
  }
  delete(id: string): Promise<number> {
    const stmts: Statement[] = [];
    const query = `delete from userRoles where userId = ${this.param(1)}`;
    stmts.push({ query, params: [id] });
    const stmt = buildToDelete(id, 'users', this.primaryKeys, this.param);
    if (!stmt) {
      return Promise.resolve(-1);
    }
    stmts.push(stmt);
    return this.execBatch(stmts);
  }
}

function insertUserRoles(stmts: Statement[], userId: string, roles: string[] | undefined, param: (i: number) => string): Statement[] {
  if (roles && roles.length > 0) {
    const userRoles = roles.map<UserRole>(i => {
      const userRole: UserRole = { userId, roleId: i };
      return userRole;
    });
    const stmt = buildToInsertBatch(userRoles, 'userRoles', userRoleModel.attributes, param);
    if (stmt) {
      stmts.push(stmt);
    }
  }
  return stmts;
}
