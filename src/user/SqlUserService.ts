import {Attributes} from 'express-ext';
import {Attribute, buildMap, buildToDelete, buildToInsert, buildToInsertBatch, buildToUpdate, keys, Model, select, Statement, StringMap} from 'query-core';
import {User} from './User';
import {userModel} from './UserModel';

export const userRoleModel: Model = {
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
export interface UserRole {
  userId?: string;
  roleId?: string;
}
export class SqlUserService {
  private keys: Attribute[];
  private map: StringMap;
  constructor(
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    public exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch?: (statements: Statement[]) => Promise<number>
  ) {
    this.metadata = this.metadata.bind(this);
    this.all = this.all.bind(this);
    this.load = this.load.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.keys = keys(userModel.attributes);
    this.map = buildMap(userModel.attributes);
  }
  metadata(): Attributes {
    return userModel.attributes;
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
  all(): Promise<User[]> {
    return this.query<User>('select * from users order by userId asc', undefined, this.map);
  }
  load(id: string): Promise<User> {
    const stmt = select(id, 'users', this.keys, this.param);
    return this.query<User>(stmt.query, stmt.params, this.map)
      .then(users => {
        if (!users || users.length === 0) {
          return null;
        }
        const user = users[0];
        const q = `select roleId as id from userRoles where userId = ${this.param(1)}`;
        return this.query(q, [user.userId]).then(roles => {
          if (roles && roles.length > 0) {
            user.roles = roles.map(i => i['id']);
          }
          return user;
        });
      });
  }
  insert(user: User): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToInsert(user, 'users', userModel.attributes, this.param);
    stmts.push(stmt);
    insertUserRoles(stmts, user.userId, user.roles, this.param);
    return this.execBatch(stmts);
  }
  update(user: User): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToUpdate(user, 'users', userModel.attributes, this.param);
    const query = `delete from userRoles where userId = ${this.param(1)}`;
    stmts.push({query, params: [user.userId]});
    insertUserRoles(stmts, user.userId, user.roles, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  patch(user: User): Promise<number> {
    return this.update(user);
  }
  delete(id: string): Promise<number> {
    const stmts: Statement[] = [];
    const query = `delete from userRoles where userId = ${this.param(1)}`;
    stmts.push({query, params: [id]});
    const stmt = buildToDelete(id, 'users', this.keys, this.param);
    stmts.push(stmt);
    return this.execBatch(stmts);
  }
}

function insertUserRoles(stmts: Statement[], userId: string, roles: string[], param: (i: number) => string): Statement[] {
  if (roles && roles.length > 0) {
    const userRoles = roles.map<UserRole>(i => {
      const userRole: UserRole = {userId, roleId: i};
      return userRole;
    });
    const stmt = buildToInsertBatch(userRoles, 'userRoles', userRoleModel.attributes, param);
    stmts.push(stmt);
  }
  return stmts;
}
