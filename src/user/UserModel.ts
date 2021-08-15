import {Model} from 'query-core';

export const userModel: Model = {
  name: 'user',
  source: 'users',
  attributes: {
    userId: {
      key: true,
      match: 'equal'
    },
    username: {
      required: true
    },
    email: {
      format: 'email',
      required: true
    },
    displayName: {},
    status: {
      match: 'equal'
    },
    gender: {
      length: 1
    },
    phone: {
      format: 'phone',
      required: true
    },
    title: {},
    position: {},
    imageURL: {},
    createdBy: {},
    createdAt: {
      type: 'datetime'
    },
    updatedBy: {},
    updatedAt: {
      type: 'datetime'
    },
    lastLogin: {
      type: 'datetime'
    }
  }
};
