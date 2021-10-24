import {Filter} from 'express-ext';

export interface RoleFilter extends Filter {
  roleId?: string;
  roleName?: string;
  status?: string;
  remark?: string;
}
