import { FileUploads, Uploads } from 'uploads';
import { User } from 'user';

export interface UploadSerive {
  all(): Promise<Uploads[]>;
  load(userId: string): Promise<Uploads>;
  insert(upload: Uploads): Promise<number>;
  getUser(id: string): Promise<User>;
  updateData(data: FileUploads[], userId: string): Promise<number>;
}
