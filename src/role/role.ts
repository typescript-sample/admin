import { Filter, Model, ResultInfo, Service } from 'onecore';

export interface RoleFilter extends Filter {
  roleId?: string;
  roleName?: string;
  status?: string;
  remark?: string;
}
export interface Role {
  roleId: string;
  roleName: string;
  status?: string;
  remark?: string;
  privileges?: string[];
}
export interface RoleService extends Service<Role, string, number | ResultInfo<Role>, RoleFilter> {
  assign(id: string, users: string[]): Promise<number>;
}

export const roleModel: Model = {
  name: 'role',
  source: 'roles',
  attributes: {
    roleId: {
      key: true,
      length: 40
    },
    roleName: {
      required: true,
      length: 255
    },
    status: {
      match: 'equal',
      length: 1
    },
    remark: {
      length: 255
    },
    createdBy: {},
    createdAt: {
      type: 'datetime'
    },
    updatedBy: {},
    updatedAt: {
      type: 'datetime'
    },
    privileges: {
      type: 'primitives',
      ignored: true
    }
  }
};
