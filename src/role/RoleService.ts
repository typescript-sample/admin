import {Attributes, SearchResult} from 'query-core';
import { RoleFilter } from 'role';
import {Role} from './Role';

export interface RoleService {
  all(): Promise<Role[]>;
  metadata?(): Attributes;
  search(s: RoleFilter, limit?: number, offset?: number|string, fields?: string[]): Promise<SearchResult<Role>>;
  load(id: string): Promise<Role|null>;
  insert(user: Role): Promise<number>;
  update(user: Role): Promise<number>;
  delete(id: string): Promise<number>;
  assign(id: string, users: string[]): Promise<number>;
}
