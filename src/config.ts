export const config = {
  port: 8080,
  secure: false,
  cookie: false,
  allow: {
    origin: 'http://localhost:3001',
    credentials: 'true',
    methods: 'GET,PUT,POST,DELETE,OPTIONS,PATCH',
    headers: 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
  },
  log: {
    level: 'debug',
    map: {
      time: '@timestamp',
      msg: 'message'
    },
    db: true
  },
  middleware: {
    log: true,
    skips: 'health,log',
    request: 'request',
    response: '',
    status: 'status',
    size: 'size'
  },
  ldap: {
    options: {
      url: 'ldap://ldap.forumsys.com:389'
    },
    dn: 'dc=example,dc=com',
    attributes: ['mail', 'displayName', 'uid'],
    map: {
      id: 'uid'
    },
    users: 'kaka,zinedine.zidane,gareth.bale'
  },
  db: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'abcd1234',
    database: 'backoffice',
    multipleStatements: true,
  },
  template: false,
  auth: {
    token: {
      secret: 'secretbackoffice',
      expires: 86400000
    },
    status: {
      success: 1
    },
    payload: {
      id: 'id',
      username: 'username',
      email: 'email',
      userType: 'userType'
    },
    account: {
      displayName: 'displayname'
    },
    userStatus: {
      activated: 'A',
      deactivated: 'D'
    },
    db: {
      status: 'status',
      sql: {
        query: 'select userId as id, username, email, displayname, status from users where username = ?'
      }
    }
  },
  sql: {
    allPrivileges: `
      select moduleId as id,
        moduleName as name,
        resourceKey as resource_key,
        path,
        icon,
        parent,
        sequence
      from modules
      where status = 'A'`,
    privileges: `
      select distinct m.moduleId as id, m.moduleName as name, m.resourceKey as resource,
        m.path, m.icon, m.parent, m.sequence, rm.permissions
      from users u
        inner join userRoles ur on u.userId = ur.userId
        inner join roles r on ur.roleId = r.roleId
        inner join roleModules rm on r.roleId = rm.roleId
        inner join modules m on rm.moduleId = m.moduleId
      where u.userId = ? and r.status = 'A' and m.status = 'A'
      order by sequence`,
    permission: `
      select distinct rm.permissions
      from users u
        inner join userRoles ur on u.userId = ur.userId
        inner join roles r on ur.roleId = r.roleId
        inner join roleModules rm on r.roleId = rm.roleId
        inner join modules m on rm.moduleId = m.moduleId
      where u.userId = ? and u.status = 'A' and r.status = 'A' and rm.moduleId = ? and m.status = 'A'
      order by sequence`,
  }
};
export const env = {
  sit: {
    secure: true,
    log: {
      db: false
    },
    db: {
      database: 'masterdata_sit',
    }
  },
  prd: {
    secure: true,
    log: {
      db: false
    },
    middleware: {
      log: false
    }
  }
};
