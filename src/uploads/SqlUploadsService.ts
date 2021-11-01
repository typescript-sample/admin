import { Pool, PoolClient } from 'pg';
import { save } from 'postgre';
import { Attribute, Statement, StringMap } from 'query-core';
import { FileUploads, Uploads } from 'uploads';
import { User } from 'user';
import { uploadModel } from './UploadModel';

export class SqlUploadSerive {
  private map: StringMap;
  protected client: PoolClient;
  constructor(
    pool: Pool,
    public directory: string,
    public storageUpload: (directory: string, name: string, data: string | Buffer) => Promise<string>,
    public storageDelete: (directory: string, filename: string) => Promise<boolean>,
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
    public exec: (sql: string, args?: any[]) => Promise<number>,
    public execBatch?: (statements: Statement[]) => Promise<number>,
  ) {
    pool.connect().then(client => this.client = client);
    this.all = this.all.bind(this);
    this.insert = this.insert.bind(this);
    this.load = this.load.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateData = this.updateData.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.insertData = this.insertData.bind(this);
    this.deleteData = this.deleteData.bind(this);
  }
  all(): Promise<Uploads[]> {
    return this.query<Uploads>('select * from uploads order by userid asc', undefined, this.map);
  }
  insert(upload: Uploads): Promise<number> {
    return save(this.client, upload, 'uploads', uploadModel.attributes);
  }
  insertData(uploadReq: Uploads): Promise<number> {
    return this.load(uploadReq.userId).then((upload) => {
      if (upload) {
        upload.data.push(uploadReq.data[0]);
        return this.insert({ userId: uploadReq.userId, data: upload.data }).then((res) => res);
      } else {
        return this.insert({ userId: uploadReq.userId, data: [uploadReq.data[0]] }).then((res) => res);
      }
    }).catch((err) => {
      console.log(err);
      throw err;
    });
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
      throw e;
    });
  }
  uploadFile(id: string, source: string, type: string, name: string, fileBuffer: Buffer): Promise<string> {
    return this.storageUpload(this.directory, name, fileBuffer)
    .then((result) => {
      return this.load(id).then((upload) => {
        if (upload) {
          upload.data.push({ source, type, url: result });
          return this.insert({ userId: id, data: upload.data }).then(() => result);
        } else {
          return this.insert({ userId: id, data: [{ source, type, url: result }] }).then(() => result);
        }
      })
    })
    .catch((err) => {
      throw err;
    });
  }
  deleteFile(userId:string, fileName:string, url: string): Promise<number> {
    return this.storageDelete(this.directory, fileName).then((result) => {
      if (result) {
        return this.load(userId).then(upload => {
          const deleteFile = upload.data.findIndex(item => item.url === url);
          const userImageUrl = upload.data.filter(d => d.type === 'image')[0].url;
          if (deleteFile > -1 && url !== userImageUrl) {
            upload.data.splice(deleteFile, 1);
            return this.insert({ userId: userId.toString(), data: upload.data }).then((res) =>  res);
          } else if (deleteFile > -1 && url === userImageUrl) {
            upload.data.splice(deleteFile, 1);
            return this.updateData(userId.toString(), upload.data).then((res) => res);
          } else {
            return 1;
          }
        });
      }
    })
    .catch((err) => {
      throw err;
    });
  }
  getUser(id: string): Promise<User> {
    return this.query<User>('select * from users where userid = $1', [id]).then(res => {
      return res[0];
    }).catch(e => {
      console.log(e);
      throw e;
    });
  }
  updateData(userId: string, data: FileUploads[]): Promise<number> {
    const imageUrl = data.filter(d => d.type === 'image')[0].url;
    const statementData: Statement = { query: 'update uploads set data = $1 where userid = $2', params: [data, userId] };
    const statementUser: Statement = { query: 'update users set imageurl = $1 where userid = $2', params: [imageUrl, userId] };
    return this.execBatch([statementData, statementUser]).then(r => r).catch(e => {
      console.log(e);
      throw e;
    });
  }
  deleteData(userId: string, url: string): Promise<number> {
    return this.load(userId).then(upload => {
      const deleteFile = upload.data.findIndex(item => item.url === url);
      if (deleteFile > -1) {
        upload.data.splice(deleteFile, 1);
        return this.insert({ userId: userId.toString(), data: upload.data }).then((res) => res);
      } else {
        return 0;
      }
    }).catch(e => {
      throw e
    });
  }
}


