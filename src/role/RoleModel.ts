import {Model} from 'query-core';

export const roleModel: Model = {
  name: 'role',
  source: 'roles',
  attributes: {
    roleId: {
      key: true
    },
    roleName: {
      required: true
    },
    status: {
      match: 'equal'
    },
    remark: {},
    createdBy: {},
    createdAt: {
      type: 'datetime'
    },
    updatedBy: {},
    updatedAt: {
      type: 'datetime'
    }
  }
};
