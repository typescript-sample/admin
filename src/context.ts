import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { buildJwtError, Payload, verify } from 'jsonwebtoken-plus';
import { createChecker, DB } from 'query-core';
import { Authorize, Authorizer, PrivilegeLoader, Token } from 'security-express';
import { check } from 'types-validation';
import { createValidator } from 'xvalidators';
import { RoleController, useRoleController } from './role';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;
resources.check = check;

export interface Config {
  token: Token;
  sql: {
    permission: string;
  };
}
export interface ApplicationContext {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  role: RoleController;
  user: UserController;
  authorize: Authorize;
}
export function useContext(db: DB, logger: Logger, midLogger: Middleware, conf: Config): ApplicationContext {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);
  const privilegeLoader = new PrivilegeLoader(conf.sql.permission, db.query);
  const authorizer = new Authorizer<Payload>(conf.token.secret, verify, privilegeLoader.privilege, buildJwtError, true);

  const role = useRoleController(logger.error, db);
  const user = useUserController(logger.error, db);

  const ctx: ApplicationContext = { health, log, middleware, role, user, authorize: authorizer.authorize };
  return ctx;
}
