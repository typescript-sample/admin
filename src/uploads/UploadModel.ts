import {Model} from 'query-core';

export const uploadModel: Model = {
  name: 'upload',
  source: 'uploads',
  attributes: {
    userId: {
      key: true,
      match: 'equal',
      length: 40
    },
    data: {
      type: 'primitives'
    },
  }
};
