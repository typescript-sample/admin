import { FileUploads, Uploads } from 'uploads';
import { User } from 'user';

export interface UploadSerive {
  all(): Promise<Uploads[]>;
  load(userId: string): Promise<Uploads>;
  insert(upload: Uploads): Promise<number>;
  insertData(upload: Uploads): Promise<number>;
  getUser(id: string): Promise<User>;
  updateData(userId: string, data: FileUploads[]): Promise<number>;
  uploadFile(id: string, source: string, type: string, name: string, fileBuffer: Buffer): Promise<string>;
  deleteFile(userId:string, fileName:string, url: string): Promise<number>;
  deleteData(userId: string, url: string): Promise<number>;
}
