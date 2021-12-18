export const config = {
  port: 8080,
  log: {
    level: 'info',
    map: {
      time: '@timestamp',
      msg: 'message'
    }
  },
  middleware: {
    log: true,
    skips: 'health,log',
    request: 'request',
    response: 'response',
    status: 'status',
    size: 'size'
  },
  db: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'abcd1234',
    database: 'backoffice',
    multipleStatements: true,
  }
};

export const env = {
  sit: {
    port: 8082,
    db: {
      database: 'masterdata_sit',
    }
  },
  prd: {
    log: false
  }
};
