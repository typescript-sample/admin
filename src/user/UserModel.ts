import {Model} from 'query-core';

export const userModel: Model = {
  name: 'user',
  source: 'users',
  attributes: {
    userId: {
      key: true,
      match: 'equal',
      length: 40
    },
    username: {
      required: true,
      length: 255
    },
    email: {
      format: 'email',
      required: true,
      length: 120
    },
    displayName: {
      length: 120
    },
    status: {
      match: 'equal',
      length: 1
    },
    gender: {
      length: 1
    },
    phone: {
      format: 'phone',
      required: true,
      length: 14
    },
    title: {
      length: 10
    },
    position: {
      length: 10
    },
    imageURL: {
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
    lastLogin: {
      type: 'datetime'
    }
  }
};
