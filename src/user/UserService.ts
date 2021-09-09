import {User} from './User';

export interface UserService {
  all(): Promise<User[]>;
  load(id: string): Promise<User>;
  insert(user: User): Promise<number>;
  update(user: User): Promise<number>;
  delete(id: string): Promise<number>;
  getUsersOfRole(roleId: string): Promise<User[]>;
}
