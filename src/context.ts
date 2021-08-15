import {HealthController} from 'express-ext';
import {RoleController} from './role';
import {UserController} from './user';

export interface ApplicationContext {
  health: HealthController;
  role: RoleController;
  user: UserController;
}
