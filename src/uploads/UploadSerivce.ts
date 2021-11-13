
import { User } from 'user';
import { FileUploads, Upload } from './Upload';

export interface UploadSerive {
  all(): Promise<Upload[]>;
  load(userId: string): Promise<Upload>;
  insert(upload: Upload): Promise<number>;
  insertData(upload: Upload): Promise<number>;
  getUser(id: string): Promise<User>;
  updateData(userId: string, data: FileUploads[]): Promise<number>;
  uploadFile(id: string, source: string, type: string, name: string, fileBuffer: Buffer): Promise<string>;
  deleteFile(userId: string, fileName: string, url: string): Promise<number>;
  deleteData(userId: string, url: string): Promise<number>;
}
