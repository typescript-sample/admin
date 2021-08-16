import {DateRange, SearchModel} from 'express-ext';

export interface RoleSM extends SearchModel {
  roleId?: string;
  roleName?: string;
  status?: string;
  remark?: string;
}
