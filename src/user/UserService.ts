import {Attributes, SearchResult} from 'query-core';
import {UserFilter} from 'user';
import {User} from './User';

export interface UserService {
  metadata?(): Attributes;
  search(s: UserFilter, limit?: number, offset?: number|string, fields?: string[]): Promise<SearchResult<User>>;
  all(): Promise<User[]>;
  load(id: string): Promise<User|null>;
  insert(user: User): Promise<number>;
  update(user: User): Promise<number>;
  delete(id: string): Promise<number>;
  getUsersOfRole(roleId: string): Promise<User[]>;
}
