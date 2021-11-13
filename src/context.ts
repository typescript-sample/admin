import { HealthController } from 'express-ext';
import { UploadController } from 'uploads/UploadController';
import { AuthController } from './auth/authController';
import { RoleController } from './role';
import { UserController } from './user';

export interface ApplicationContext {
  health: HealthController;
  role: RoleController;
  user: UserController;
  uploads: UploadController;
  auth: AuthController;
}
