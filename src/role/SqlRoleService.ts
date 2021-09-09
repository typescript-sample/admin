import {Attributes} from 'express-ext';
import {Attribute, buildMap, buildToDelete, buildToInsert, buildToInsertBatch, buildToUpdate, keys, Model, SearchResult, select, Statement, StringMap} from 'query-core';
import {Role} from './Role';
import {roleModel} from './RoleModel';
import {RoleSM} from './RoleSM';

export interface UserRole {
  userId?: string;
  roleId?: string;
}
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
export const roleModuleModel: Model = {
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
export interface Module {
  moduleId?: string;
  roleId?: string;
  permissions?: number;
}
export class SqlRoleService {
  private keys: Attribute[];
  private map: StringMap;
  private roleModuleMap: StringMap;
  constructor(
    protected find: (s: RoleSM, limit?: number, offset?: number|string, fields?: string[]) => Promise<SearchResult<Role>>,
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    public exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch?: (statements: Statement[]) => Promise<number>
  ) {
    this.metadata = this.metadata.bind(this);
    this.search = this.search.bind(this);
    this.all = this.all.bind(this);
    this.load = this.load.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.keys = keys(roleModel.attributes);
    this.map = buildMap(roleModel.attributes);
    this.roleModuleMap = buildMap(roleModuleModel.attributes);
  }
  metadata(): Attributes {
    return roleModel.attributes;
  }
  search(s: RoleSM, limit?: number, offset?: number|string, fields?: string[]): Promise<SearchResult<Role>> {
    return this.find(s, limit, offset, fields);
  }
  all(): Promise<Role[]> {
    return this.query<Role>('select * from roles order by roleId asc', undefined, this.map);
  }
  load(id: string): Promise<Role> {
    const stmt = select(id, 'roles', this.keys, this.param);
    return this.query<Role>(stmt.query, stmt.params, this.map)
      .then(roles => {
        if (!roles || roles.length === 0) {
          return null;
        }
        const role = roles[0];
        const q = `select moduleId, permissions from roleModules where roleId = ${this.param(1)}`;
        return this.query<Module>(q, [role.roleId], this.roleModuleMap).then(modules => {
          if (modules && modules.length > 0) {
            role.privileges = modules.map(i => (i.permissions ? i.moduleId + ' ' + i.permissions.toString(16) : i.moduleId));
          }
          return role;
        });
      });
  }
  insert(role: Role): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToInsert(role, 'roles', roleModel.attributes, this.param);
    stmts.push(stmt);
    insertRoleModules(stmts, role.roleId, role.privileges, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  update(role: Role): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToUpdate(role, 'roles', roleModel.attributes, this.param);
    stmts.push(stmt);
    const query = `delete from roleModules where roleId = ${this.param(1)}`;
    stmts.push({query, params: [role.roleId]});
    insertRoleModules(stmts, role.roleId, role.privileges, this.param);
    return this.execBatch(stmts);
  }
  patch(role: Role): Promise<number> {
    return this.update(role);
  }
  delete(id: string): Promise<number> {
    const stmts: Statement[] = [];
    const stmt = buildToDelete(id, 'roles', this.keys, this.param);
    stmts.push(stmt);
    const query = `delete from roleModules where userId = ${this.param(1)}`;
    stmts.push({query, params: [id]});
    return this.execBatch(stmts);
  }
  assign(roleId: string, users: string[]): Promise<number> {
    const userRoles: UserRole[] = users.map<UserRole>(u => {
      return {roleId, userId: u};
    });
    const stmts: Statement[] = [];
    const q1 = `delete from userRoles where roleId = ${this.param(1)}`;
    stmts.push({query: q1, params: [roleId]});
    const s = buildToInsertBatch<UserRole>(userRoles, 'userRoles', userRoleModel.attributes, this.param);
    stmts.push(s);
    return this.execBatch(stmts);
  }
}
function insertRoleModules(stmts: Statement[], roleId: string, privileges: string[], param: (i: number) => string): Statement[] {
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
      const ms: Module = {roleId, moduleId: i, permissions};
      return ms;
    });
    const stmt = buildToInsertBatch(modules, 'roleModules', roleModuleModel.attributes, param);
    stmts.push(stmt);
  }
  return stmts;
}
