import {HealthController} from 'express-ext';
import {Pool} from 'mysql';
import {MySQLChecker, param, PoolManager} from 'mysql-core';
import {mysql, SearchBuilder} from 'query-core';
import {ApplicationContext} from './context';
import {Role, RoleController, roleModel, RoleSM, SqlRoleService} from './role';
import {SqlUserService, User, UserController, userModel, UserSM} from './user';

export function log(msg: string, ctx?: any): void {
  console.log(msg);
}
export function createContext(pool: Pool): ApplicationContext {
  const sqlChecker = new MySQLChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);

  const roleService = new SqlRoleService(param, manager.query, manager.exec, manager.execBatch);
  const roleSearch = new SearchBuilder<Role, RoleSM>(manager.query, 'roles', roleModel.attributes, mysql);
  const role = new RoleController(log, roleSearch.search, roleService);

  const userService = new SqlUserService(param, manager.query, manager.exec, manager.execBatch);
  const userSearch = new SearchBuilder<User, UserSM>(manager.query, 'users', userModel.attributes, mysql);
  const user = new UserController(log, userSearch.search, userService);

  const ctx: ApplicationContext = {health, role, user};
  return ctx;
}