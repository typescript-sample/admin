export interface Role {
  roleId: string;
  roleName: string;
  status?: string;
  remark?: string;
  privileges?: string[];
}
export interface Privilege {
  id: string;
  name: string;
  children?: Privilege[];
}
