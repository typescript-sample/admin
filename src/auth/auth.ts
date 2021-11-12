export interface User {
  userId: string;
  username: string;
  email?: string;
  phone?: string;
  status?: String;
  displayName?: string;
  dateOfBirth?: Date;
  imageUrl?: string;
}

export interface AuthModal {
  status: number,
  user: UserInfo,
}

export interface UserInfo {
  displayName:string,
  id: string,
  token:string,
  tokenExpiredTime: Date,
  privileges: Privileges[],
}

export interface PrivilegesChildren {
  icon?: string,
  id: string,
  name: string,
  path: string,
  permissions: number,
  resource: string,
  sequence: 999,
}

export interface Privileges extends PrivilegesChildren {
  children: PrivilegesChildren[],
}