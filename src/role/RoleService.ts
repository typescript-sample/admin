import { ResultInfo, RoleSM } from 'onecore';
import { GenericSearchService } from 'onecore';
import { Privilege, Role } from './Role'

export interface RoleService extends GenericSearchService<Role, any, number | ResultInfo<Role>, RoleSM> {
  getPrivileges?(ctx?: any): Promise<Privilege[]>;
}
