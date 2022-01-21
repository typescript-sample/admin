import { AuthenticationController, PrivilegeController } from 'authen-express';
import { AuthResult, initializeStatus, PrivilegeRepository, PrivilegesReader, SqlAuthConfig, useAuthenticator, User, useUserRepository } from 'authen-service';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { buildJwtError, generate, Payload, verify } from 'jsonwebtoken-plus';
import { createChecker, DB } from 'query-core';
import { TemplateMap, useTemplate } from 'query-templates';
import { Authorize, Authorizer, PrivilegeLoader, useToken } from 'security-express';
import { check } from 'types-validation';
import { createValidator } from 'xvalidators';
import { RoleController, useRoleController } from './role';
import { UserController, useUserController } from './user';
resources.createValidator = createValidator;
resources.check = check;

export interface Config {
  cookie?: boolean;
  auth: SqlAuthConfig;
  sql: {
    allPrivileges: string;
    privileges: string;
    permission: string;
  };
}
export interface Context {
  health: HealthController;
  log: LogController;
  middleware: MiddlewareController;
  authorize: Authorize;
  authentication: AuthenticationController<User>;
  privilege: PrivilegeController;
  role: RoleController;
  user: UserController;
}
export function useContext(db: DB, logger: Logger, midLogger: Middleware, conf: Config, mapper?: TemplateMap): Context {
  const auth = conf.auth;
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);
  const privilegeLoader = new PrivilegeLoader(conf.sql.permission, db.query);
  const token = useToken<Payload>(auth.token.secret, verify, buildJwtError, conf.cookie);
  const authorizer = new Authorizer<Payload>(token, privilegeLoader.privilege, buildJwtError, true);

  const status = initializeStatus(auth.status);
  const privilegeRepository = new PrivilegeRepository(db.query, conf.sql.privileges);
  const userRepository = useUserRepository(db, auth);
  const authenticator = useAuthenticator(status, authenticate, generate, auth.token, auth.payload, auth.account, userRepository, privilegeRepository.privileges, auth.lockedMinutes, auth.maxPasswordFailed);
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, conf.cookie);
  const privilegesLoader = new PrivilegesReader(db.query, conf.sql.allPrivileges);
  const privilege = new PrivilegeController(logger.error, privilegesLoader.privileges);

  const build = useTemplate(mapper);
  const role = useRoleController(logger.error, db, mapper, build);
  const user = useUserController(logger.error, db, mapper, build);

  return { health, log, middleware, authorize: authorizer.authorize, authentication, privilege, role, user };
}
export function authenticate(user: User): Promise<AuthResult> {
  const res: AuthResult = {status: 1};
  return Promise.resolve(res);
}
