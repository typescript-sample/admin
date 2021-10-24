import {HealthController, resources} from 'express-ext';
import {Pool} from 'mysql';
import {MySQLChecker, param, PoolManager} from 'mysql-core';
import {mysql, SearchBuilder} from 'query-core';
import { createValidator } from 'validator-x';
import {ApplicationContext} from './context';
import {Role, RoleController, RoleFilter, roleModel, SqlRoleService} from './role';
import {SqlUserService, User, UserController, UserFilter, userModel} from './user';

export function log(msg: string, ctx?: any): void {
  console.log(msg);
}
resources.createValidator = createValidator;
export function createContext(pool: Pool): ApplicationContext {
  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);

  const roleSearch = new SearchBuilder<Role, RoleFilter>(manager.query, 'roles', roleModel.attributes, mysql);
  const roleService = new SqlRoleService(roleSearch.search, param, manager.query, manager.exec, manager.execBatch);
  const role = new RoleController(log, roleSearch.search, roleService);

  const userSearch = new SearchBuilder<User, UserFilter>(manager.query, 'users', userModel.attributes, mysql);
  const userService = new SqlUserService(userSearch.search, param, manager.query, manager.exec, manager.execBatch);
  const user = new UserController(log, userSearch.search, userService);

  const ctx: ApplicationContext = {health, role, user};
  return ctx;
}
