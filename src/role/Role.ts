export interface Role {
  roleId: string;
  roleName: string;
  status?: string;
  remark?: string;
  privileges?: string[];
}
