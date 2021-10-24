import { ResultInfo, Service } from 'onecore';
import { Role } from './Role';
import { RoleFilter } from './RoleFilter';

export interface RoleService extends Service<Role, string, number | ResultInfo<Role>, RoleFilter> {
  assign(id: string, users: string[]): Promise<number>;
}
