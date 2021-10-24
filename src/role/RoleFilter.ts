import { Filter } from 'onecore';

export interface RoleFilter extends Filter {
  roleId?: string;
  roleName?: string;
  status?: string;
  remark?: string;
}
