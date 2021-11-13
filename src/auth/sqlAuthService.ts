import { sign } from 'jsonwebtoken';
import { Attribute, buildMap, keys, Model, StringMap } from 'query-core';
import { AuthModal, Privileges, User } from './auth';
import { userModel } from './authModel';

export interface RoleId {
  roleId: string;
}

export const role: Model = {
  name: 'role',
  source: 'role',
  attributes: {
    roleId: {
      key: true
    },
  }
};

const privileges: Privileges[] = [
  {
    children: null,
    icon: 'assignments',
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    permissions: 3,
    resource: 'dashboard',
    sequence: 999,
  },
  {
    children: [
      {
        icon: 'person',
        id: 'user',
        name: 'User Management',
        path: '/users',
        permissions: 3,
        resource: 'user',
        sequence: 999,
      },
      {
        icon: 'credit_card',
        id: 'role',
        name: 'Role Management',
        path: '/roles',
        permissions: 3,
        resource: 'role',
        sequence: 999,
      },
      {
        icon: 'credit_card',
        id: 'role_assignment',
        name: 'Role Management',
        path: '/role-assignment',
        permissions: 3,
        resource: 'role_assignment',
        sequence: 999,
      },
      {
        icon: 'zoom_in',
        id: 'audit_log',
        name: 'Audit Log',
        path: '/audit-logs',
        permissions: 3,
        resource: 'audit_log',
        sequence: 999,
      }
    ],
    icon: 'contacts',
    id: 'admin',
    name: 'Admin',
    path: '/admin',
    permissions: 3,
    resource: 'admin',
    sequence: 999,
  },
  {
    children: [
      {
        icon: 'group',
        id: 'group',
        name: 'Group',
        path: '/group',
        permissions: 3,
        resource: 'group',
        sequence: 999,
      },
      {
        id: 'company',
        name: 'Company Profile',
        path: '/companies',
        permissions: 3,
        resource: 'company',
        sequence: 999,
      },
      {
        id: 'product',
        name: 'Product Profile',
        path: '/products',
        permissions: 3,
        resource: 'product',
        sequence: 999,
      },
      {
        id: 'fee',
        name: 'Fee Profile',
        path: '/fees',
        permissions: 3,
        resource: 'fee',
        sequence: 999,
      },
      {
        id: 'merchant',
        name: 'Merchant Profile',
        path: '/merchants',
        permissions: 3,
        resource: 'merchant',
        sequence: 999,
      }
    ],
    icon: 'settings',
    id: 'setup',
    name: 'Setup',
    path: '/setup',
    permissions: 3,
    resource: 'setup',
    sequence: 999,
  },
  {
    children: [
      {
        icon: 'zoom_in',
        id: 'activity_log',
        name: 'Activity Log',
        path: '/activity-logs',
        permissions: 3,
        resource: 'activity_log',
        sequence: 999,
      },
      {
        icon: 'chrome_reader_mode',
        id: 'operation_report',
        name: 'Operation Report',
        path: '/operation-report',
        permissions: 3,
        resource: 'operation_report',
        sequence: 999,
      },
      {
        id: 'merchant_report',
        name: 'Merchant Report',
        path: '/merchant-report',
        permissions: 3,
        resource: 'merchant_report',
        sequence: 999,
      },
      {
        icon: 'attach_money',
        id: 'merchant_fee_report',
        name: 'Merchant Fee Report',
        path: '/merchant-fee-report',
        permissions: 3,
        resource: 'merchant_fee_report',
        sequence: 999
      },
      {
        id: 'summary_report',
        name: 'Summary Report',
        path: '/summary-report',
        permissions: 3,
        resource: 'summary_report',
        sequence: 999,
      },
      {
        id: 'transaction_report',
        name: 'Transaction Report',
        path: '/transaction-report',
        permissions: 3,
        resource: 'transaction_report',
        sequence: 999,
      }
    ],
    icon: 'pie_chart',
    id: 'report',
    name: 'Report',
    path: '/report',
    permissions: 3,
    resource: 'report',
    sequence: 999
  }
];

export class Auth {
  private keys: Attribute[];
  private map: StringMap;
  constructor (
    private secretKey: string,
    public param: (i: number) => string,
    public query: <T>(sql: string, args?: any[], m?: StringMap, bools?: Attribute[]) => Promise<T[]>,
  ) {
    this.authenticate = this.authenticate.bind(this);
    this.keys = keys(userModel.attributes);
    this.map = buildMap(userModel.attributes);
  }

  authenticate(username: string, password: string): Promise<AuthModal> {
    const q = `select * from users where username = ${this.param(1)}`;
    return this.query<User>(q, [username], this.map).then(users => {
      const user = users[0];
      if (user.status !== 'A') {
        throw new Error(`accout isn't active`);
      }
      const result: AuthModal = {
        status: 1,
        user: {
          id: user.userId,
          displayName: user.displayName,
          token: sign({id: user.userId}, this.secretKey, { expiresIn: '15m' }),
          tokenExpiredTime: new Date((new Date()).getTime() + (15 * 60 * 1000)),
          privileges,
        }
      };
      return result;
    }).catch(err => {
      throw err;
    });
  }
}
