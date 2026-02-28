export const config = {
  port: 8083,
  https: false,
  key: "./config/key.pem",
  cert: "./config/cert.pem",
  secure: false,
  cookie: false,
  allow: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://192.168.2.105:3000"],
    credentials: "true",
    methods: "GET,PUT,POST,DELETE,OPTIONS,PATCH",
    headers:
      "Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
  },
  log: {
    level: "debug",
    map: {
      time: "@timestamp",
      msg: "message",
    },
    db: true,
  },
  middleware: {
    log: true,
    skips: "health,log",
    request: "request",
    response: "",
    status: "status",
    size: "size",
  },
  ldap: {
    options: {
      url: "ldap://fake-ldap.server.com:389",
    },
    dn: "dc=example,dc=com",
    attributes: ["mail", "displayName", "uid"],
    map: {
      id: "uid",
    },
    users: "kaka,zinedine.zidane,gareth.bale",
  },
  db: {
    connectionString: "postgres://postgres:abcd1234@localhost/backoffice",
  },
  template: false,
  auth: {
    token: {
      secret: "secretbackoffice",
      expires: 86400000,
    },
    status: {
      success: 1,
    },
    payload: {
      id: "id",
      username: "username",
      email: "email",
      userType: "userType",
    },
    account: {
      displayName: "displayname",
    },
    userStatus: {
      activated: "A",
      deactivated: "D",
    },
    db: {
      user: "users",
      password: "passwords",
      id: "id",
      username: "username",
      status: "status",
      successTime: "",
      failTime: "",
      failCount: "",
      lockedUntilTime: "",
    },
    query: "select user_id as id, username, email, display_name as displayname, status from users where username = $1",
  },
  sql: {
    allPrivileges: `
      select module_id as id,
        module_name as name,
        resource_key,
        path,
        icon,
        parent,
        actions,
        sequence
      from modules
      where status = 'A'`,
    privileges: `
      select distinct m.module_id as id, m.module_name as name, m.resource_key as resource,
        m.path, m.icon, m.parent, m.sequence, rm.permissions, m.actions
      from users u
        inner join user_roles ur on u.user_id = ur.user_id
        inner join roles r on ur.role_id = r.role_id
        inner join role_modules rm on r.role_id = rm.role_id
        inner join modules m on rm.module_id = m.module_id
      where u.user_id = $1 and r.status = 'A' and m.status = 'A'
      order by sequence`,
    permission: `
      select distinct rm.permissions
      from users u
        inner join user_roles ur on u.user_id = ur.user_id
        inner join roles r on ur.role_id = r.role_id
        inner join role_modules rm on r.role_id = rm.role_id
        inner join modules m on rm.module_id = m.module_id
      where u.user_id = $1 and u.status = 'A' and r.status = 'A' and rm.module_id = $2 and m.status = 'A'`,
  },
}
export const env = {
  sit: {
    secure: true,
    log: {
      db: false,
    },
    db: {
      database: "masterdata_sit",
    },
  },
  prd: {
    secure: true,
    log: {
      db: false,
    },
    middleware: {
      log: false,
    },
  },
}
