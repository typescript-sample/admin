// import { Pool, PoolClient } from 'pg';
import { Attribute, Statement, StringMap } from 'query-core';
// import {save} from 'postgre';
import { Database } from 'sqlite3';
import { save } from 'sqlite3-core';
import { FileUploads, Uploads } from 'uploads';
import { User } from 'user';
import { uploadModel } from './UploadModel';

export class SqlUploadSerive {
  private map: StringMap;
  private keys: Attribute[];
  // protected client: PoolClient;
  constructor(
    private pool: Database,
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    public exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch?: (statements: Statement[]) => Promise<number>,
  ) {
    // pool.connect().then(client => this.client = client);
    this.all = this.all.bind(this);
    this.insert = this.insert.bind(this);
    this.load = this.load.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateData = this.updateData.bind(this);
  }
  all(): Promise<Uploads[]> {
    return this.query<Uploads>('select * from uploads order by userid asc', undefined, this.map);
  }
  insert(upload: Uploads): Promise<number> {
    return save(this.pool, upload, 'uploads', uploadModel.attributes);
  }
  load(id: string): Promise<Uploads> {
    return this.query<Uploads>('select * from uploads where userid = $1', [id]).then((uploads) => {
      if (!uploads || uploads.length === 0) {
        return null;
      } else {
        return uploads[0];
      }
    }).catch(e => {
      console.log(e);
      return e;
    });
  }
  getUser(id: string): Promise<User> {
    return this.query<User>('select * from users where userid = $1', [id]).then(res => {
      return res[0];
    }).catch(e => {
      console.log(e);
      return e;
    });
  }
  updateData(data: FileUploads[], userId: string): Promise<number> {
    const imageUrl = data.filter(d => d.type === 'image')[0].url;
    const statementData: Statement = { query: 'update uploads set data = $1 where userid = $2', params: [data, userId] };
    const statementUser: Statement = { query: 'update users set imageurl = $1 where userid = $2', params: [imageUrl, userId] };
    return this.execBatch([statementData, statementUser]).then(r => r).catch(e => {
      console.log(e);
      return e;
    });
  }
}
