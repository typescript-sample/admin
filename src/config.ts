export const config = {
  port: 8080,
  secure: true,
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
  },
  token: {
    secret: 'secretbackoffice',
    expires: 86400000
  },
  sql: {
    permission: `
      select distinct rm.permissions
      from users u
        inner join userRoles ur on u.userId = ur.userId
        inner join roles r on ur.roleId = r.roleId
        inner join roleModules rm on r.roleId = rm.roleId
        inner join modules m on rm.moduleId = m.moduleId
      where u.userId = ? and u.status = 'A' and r.status = 'A' and rm.moduleId = ? and m.status = 'A'
      order by sequence`
  }
};

export const env = {
  sit: {
    port: 8082,
    secure: true,
    db: {
      database: 'masterdata_sit',
    }
  },
  prd: {
    secure: true,
    middleware: {
      log: false
    }
  }
};
