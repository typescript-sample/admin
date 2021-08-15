import {Model} from 'query-core';

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
    }
  }
};
