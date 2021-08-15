
import {Attributes} from 'express-ext';
import {Attribute, buildMap, buildToDelete, buildToInsert, buildToUpdate, keys, select, Statement, StringMap} from 'query-core';
import {User} from './User';
import {userModel} from './UserModel';

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
  all(): Promise<User[]> {
    return this.query<User>('select * from users order by userId asc', undefined, this.map);
  }
  load(id: string): Promise<User> {
    const stmt = select(id, 'users', this.keys, this.param);
    return this.query<User>(stmt.query, stmt.params, this.map)
      .then(r => r && r.length > 0 ? r[0] : null);
  }
  insert(user: User): Promise<number> {
    const stmt = buildToInsert(user, 'users', userModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  update(user: User): Promise<number> {
    const stmt = buildToUpdate(user, 'users', userModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  patch(user: User): Promise<number> {
    const stmt = buildToUpdate(user, 'users', userModel.attributes, this.param);
    return this.exec(stmt.query, stmt.params);
  }
  delete(id: string): Promise<number> {
    const stmt = buildToDelete(id, 'users', this.keys, this.param);
    return this.exec(stmt.query, stmt.params);
  }
}
