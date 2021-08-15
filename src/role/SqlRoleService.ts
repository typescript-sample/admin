
import {Attributes} from 'express-ext';
import {Attribute, buildMap, buildToDelete, buildToInsert, buildToUpdate, keys, select, Statement, StringMap} from 'query-core';
import {Role} from './Role';
import {roleModel} from './RoleModel';

export class SqlRoleService {
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
    this.keys = keys(roleModel.attributes);
    this.map = buildMap(roleModel.attributes);
  }
  metadata(): Attributes {
    return roleModel.attributes;
  }
  all(): Promise<Role[]> {
    return this.query<Role>('select * from roles order by roleId asc', undefined, this.map);
  }
  load(id: string): Promise<Role> {
    const stmt = select(id, 'roles', this.keys, this.param);
    return this.query<Role>(stmt.query, stmt.params, this.map)
      .then(r => r && r.length > 0 ? r[0] : null);
  }
  insert(role: Role): Promise<number> {
    const stmt = buildToInsert(role, 'roles', roleModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  update(role: Role): Promise<number> {
    const stmt = buildToUpdate(role, 'roles', roleModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  patch(role: Role): Promise<number> {
    const stmt = buildToUpdate(role, 'roles', roleModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  delete(id: string): Promise<number> {
    const stmt = buildToDelete(id, 'roles', this.keys, this.param);
    return this.exec(stmt.query, stmt.params);
  }
}
