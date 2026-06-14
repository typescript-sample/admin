import { initializeStatus, PrivilegeRepository, PrivilegesReader, SqlAuthConfig, Token, useAuthenticator, User, useUserRepository } from "authen-service"
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from "express-core-web"
import { buildJwtError, Payload, verify } from "jsonwebtoken-plus"
import { Conf, useLDAP } from "ldap-plus"
import { TemplateMap } from "query-mappers"
import { Authorize, Authorizer, PrivilegeLoader, useToken } from "security-express"
import { createChecker, DB, SearchBuilder, useGet } from "sql-core"
import { check } from "types-validation"
import { createValidator } from "validation-core"
import { AuditLog, AuditLogController, AuditLogFilter, auditLogModel, useAuditLogController } from "./audit-log"
import { AuthenticationController, PrivilegeController } from "./authentication"
import { CountryController, useCountryController } from "./country"
import { CurrencyController, useCurrencyController } from "./currency"
import { LocaleController, useLocaleController } from "./locale"
import { RoleController, useRoleController } from "./role"
import { UserController, useUserController } from "./user"

resources.createValidator = createValidator
resources.check = check

export interface Config {
  cookie?: boolean
  ldap: Conf
  token: Token
  auth: SqlAuthConfig
  sql: {
    allPrivileges: string
    privileges: string
    permission: string
  }
}
export interface Context {
  health: HealthController
  log: LogController
  middleware: MiddlewareController
  authorize: Authorize
  authentication: AuthenticationController<User, string>
  privilege: PrivilegeController
  role: RoleController
  user: UserController
  auditLog: AuditLogController
  locale: LocaleController
  country: CountryController
  currency: CurrencyController
}
export function useContext(db: DB, logger: Logger, midLogger: Middleware, cfg: Config, mapper?: TemplateMap): Context {
  const auth = cfg.auth
  const log = new LogController(logger)
  const middleware = new MiddlewareController(midLogger)
  const sqlChecker = createChecker(db)
  const health = new HealthController([sqlChecker])
  const privilegeLoader = new PrivilegeLoader(cfg.sql.permission, db.query)
  const token = useToken<Payload>(cfg.token.secret, verify, buildJwtError, cfg.cookie)
  const authorizer = new Authorizer<Payload>(token, privilegeLoader.privilege, buildJwtError, true)

  const status = initializeStatus(auth.status)
  const privilegeRepository = new PrivilegeRepository(db.query, cfg.sql.privileges)
  const userRepository = useUserRepository<string, SqlAuthConfig>(db, auth)
  const authenticate = useLDAP(cfg.ldap, status)
  const authenticator = useAuthenticator(
    status,
    authenticate,
    auth.account,
    userRepository,
    privilegeRepository.privileges,
    auth.lockedMinutes,
    auth.maxPasswordFailed,
  )
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, cfg.token.secret, cfg.token.expires, "token", cfg.cookie)
  const privilegesLoader = new PrivilegesReader(db.query, cfg.sql.allPrivileges)
  const privilege = new PrivilegeController(logger.error, privilegesLoader.privileges)

  const role = useRoleController(db, mapper)
  const user = useUserController(db, mapper)

  const builder = new SearchBuilder<AuditLog, AuditLogFilter>(db, "audit_logs", auditLogModel)
  const getAuditLog = useGet<AuditLog, string>(db, "audit_logs", auditLogModel)
  const auditLog = useAuditLogController(db)
  // const auditLog = useAuditLogController(logger.error, db);

  const locale = useLocaleController(db)
  const country = useCountryController(db)
  const currency = useCurrencyController(db)

  return { health, log, middleware, authorize: authorizer.authorize, authentication, privilege, role, user, auditLog, locale, country, currency }
}
