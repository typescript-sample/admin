import {Role} from './Role';

export interface RoleService {
  all(): Promise<Role[]>;
  load(id: string): Promise<Role>;
  insert(user: Role): Promise<number>;
  update(user: Role): Promise<number>;
  delete(id: string): Promise<number>;
  assign(id: string, users: string[]): Promise<number>;
}
