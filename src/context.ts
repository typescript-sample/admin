import { AuthResult, initializeStatus, PrivilegesLoader, PrivilegesReader, RepoConfig, StringMap, useAuthenticator, User, useUserRepository } from 'authen-service';
import { HealthController, LogController, Logger, Middleware, MiddlewareController, resources } from 'express-ext';
import { buildJwtError, generate, Payload, verify } from 'jsonwebtoken-plus';
import { createChecker, DB } from 'query-core';
import { Authorize, Authorizer, Check, Checker, PrivilegeLoader, Token, useToken } from 'security-express';
import { check } from 'types-validation';
import { createValidator } from 'xvalidators';
import { AuthenticationController, PrivilegeController } from './auth';
import { RoleController, useRoleController } from './role';
import { UserController, useUserController } from './user';

resources.createValidator = createValidator;
resources.check = check;

export interface Config {
  cookie?: boolean;
  token: Token;
  payload: StringMap;
  account: StringMap;
  auth: RepoConfig;
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
export function useContext(db: DB, logger: Logger, midLogger: Middleware, conf: Config): Context {
  const log = new LogController(logger);
  const middleware = new MiddlewareController(midLogger);
  const sqlChecker = createChecker(db);
  const health = new HealthController([sqlChecker]);
  const privilegeLoader = new PrivilegeLoader(conf.sql.permission, db.query);
  const token = useToken<Payload>(conf.token.secret, verify, buildJwtError, conf.cookie);
  const authorizer = new Authorizer<Payload>(token, privilegeLoader.privilege, buildJwtError, true);

  const status = initializeStatus(conf.auth.status);
  const privilegeRepository = new PrivilegesLoader(db.query, conf.sql.privileges);
  const userRepository = useUserRepository(db, conf.auth);
  const authenticator = useAuthenticator(status, authenticate, generate, privilegeRepository.privileges, conf.token, conf.payload, conf.account, userRepository);
  const authentication = new AuthenticationController(logger.error, authenticator.authenticate, conf.cookie);
  const privilegesLoader = new PrivilegesReader(db.query, conf.sql.allPrivileges);
  const privilege = new PrivilegeController(logger.error, privilegesLoader.privileges);

  const role = useRoleController(logger.error, db);
  const user = useUserController(logger.error, db);

  return { health, log, middleware, authorize: authorizer.authorize, authentication, privilege, role, user };
}
export function authenticate(user: User): Promise<AuthResult> {
  const x: AuthResult = {status: 1};
  return Promise.resolve(x);
}
