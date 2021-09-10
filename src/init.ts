import { Storage } from '@google-cloud/storage';
import { HealthController, resources, SearchConfig } from 'express-ext';
import { GoogleStorageService, map, StorageConfig } from 'google-storage';
import { RoleSM, UserSM } from 'onecore';
import { mysql, SearchBuilder } from 'query-core';
// import { Pool } from 'pg';
// import { PoolManager, PostgreSQLChecker, param } from 'postgre';
import { Database } from 'sqlite3';
import { PoolManager, SQLiteChecker } from 'sqlite3-core';
import { createValidator } from 'validator-x';
import { ApplicationContext } from './context';
import { Role, RoleController, roleModel, SqlRoleService } from './role';
import { SqlUploadSerive } from './uploads/SqlUploadsService';
import { UploadController } from './uploads/UploadController';
import { SqlUserService, User, UserController, userModel } from './user';


const credentials = {
  type: 'service_account',
  project_id: 'go-firestore-rest-api',
  private_key_id: '0227f21f734620a0a04a3882249f3b1cb1ab634a',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrzi/hC6NsGZyR\nc2rurmpACAn5FggHjrUshXCqbsoQUPvrMhTEPQk56hQdHNlMl+ZNue94Cv7D3LCR\nlHu68XOsPAhnx21LHPsMplIobjnXWn+fD+Ow6zvHp9RalS40PrVYS1uuIVYjeets\n8dtdFB3G9ka7Zv8oz4WBN4S18sXsV702OaBMo2IwfArTk2DCY6KYqcNEVde0sd/q\nH6pK1GvDPkgbtcklk5fUgkNz61nufnqYujsnx57GuDT9ZbreAcYTB5/hRcgMjyM6\n8tgYXdjmJLFdTsMABT/YsQ0OmDDwhVQrc0CixZtzMXg+jLRxKZuHELQ+nkJCKJBi\nTtQJ1f+dAgMBAAECggEACdL2+uvi8uX+BXUvmqlfivzKsTMYz3HSG1MgD6bZKBix\nZxAMjvIcinK/prCFHnObKDunHVqnmcSPVivC7XwsDJ+8LU8CiWaFVoJWNVikNxPG\nM27BqtawquiGZI2eQD+LuBpLCkh+t/WbSDYGQKrLTxq7DbFEiu1e6XYmwQ66UZrU\ny1U7YuRw2ML+6BiHaSdq3FH3wvBbsAfwZoNnqdqTjaj01EkNsi/lOmFXHY8gPOA1\nGRI20R4KhRkctIC4ZztXg50bRzuIkz+YX57F36kEqpLaXePUQ/pHWg+76rsCd2dD\nIrcQF8Y+Hbp4eP+7CBu3AUltOzuNeC6h69B8MKCrowKBgQDTCrzCD0SThL+6NcPR\njzwFydDbapfgzGYvleEOEUTy2akAdydrcAHlMDcuUZv7xyjam5CVS/B4vLRynl6J\n8KHkdAuU8ZLESdnfo2X9GgJWBw/RK6spebEcslWINVJWwWWsQrtjMr58WVS4hWAE\nxBIKumhf5/EICZW+BueT3j0WtwKBgQDQZ6tFc3OGE0YFVIQkalQd751dsgtjQhVZ\n4huwzaUZdtFlNJm1B6yVn9ksGAM2q0iCxDQBPOM7AF+nEpeBz+pMmdpWiOb6sKC6\nVoqIgts7lNMp2h4kJLUePgWVarbuACS1VX3qSpqdcklaAi+5WnObzC8bsmaLbZxp\nmpk4gvpoSwKBgEjoj7d3MNjJ5ra89k6CblkNlNMIqzmlQ7Qy0lJa0vgXDBS2FW8/\nfdgg5R9iYEIGVu3XCocZehUsFCb44W5ELJnRIWMuZebcIKHrQEPFZYM041j+/h3R\nBcgFMBljWnPQUoDFeRlXIYmyDtvEcByVZCpCpeZkKdf9/7ZrijuCbpZXAoGARY4k\nEoTqzJfIKeVASSsXsfoUCn5u4IzgtWQKm+K2tJ38WwvINSw/hJyaDeZhxDA8fjBf\nrv4UVM/WHNvOpyuuZix/O5xrgsXKjwZtLAyIgQU1yOUcZDHAJTzL/kdkkGCJ39+N\nq9GEcwH+y0SpivJOXXQzUMolAWnu5ywK8Vp9mqsCgYBaCkZuQ3xMkWPSYWwJ2mpq\nBrH0Zpk3ddDGo63w97C9z7zX6tIP1uxVvKVGA3LQPaj8Zvbuks8DYWV8a/6RGIP/\nTH5On0uX/VNkI1Wk9R3tstyzz7MRaBAHQOt26/le/XOptcJXWB29uKEJPpq/sfHb\nx66rIAZO4BgLcslDTj3Y2g==\n-----END PRIVATE KEY-----\n',
  client_email: 'go-firestore-rest-api@appspot.gserviceaccount.com',
  client_id: '106958727954036268529',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/go-firestore-rest-api%40appspot.gserviceaccount.com',
};

export function log(msg: string, ctx?: any): void {
  console.log(msg);
}
export function param(i: number): string {
  return '$' + i;
}
resources.createValidator = createValidator;
export function createContext(pool: Database): ApplicationContext {
  const sqlChecker = new SQLiteChecker(pool);
  const health = new HealthController([sqlChecker]);
  const manager = new PoolManager(pool);
  const config: SearchConfig = { list: 'list' };

  const roleSearch = new SearchBuilder<Role, RoleSM>(manager.query, 'roles', roleModel.attributes, mysql);
  const roleService = new SqlRoleService(roleSearch.search, param, manager.query, manager.exec, manager.execBatch);
  const role = new RoleController(log, roleSearch.search, roleService, config);

  const userSearch = new SearchBuilder<User, UserSM>(manager.query, 'users', userModel.attributes, mysql);
  const userService = new SqlUserService(userSearch.search, param, manager.query, manager.exec, manager.execBatch);
  const user = new UserController(log, userSearch.search, userService, config);


  const storageConfig: StorageConfig = { bucket: 'go-firestore-rest-api.appspot.com', public: true };
  const storage = new Storage({ credentials });
  const bucket = storage.bucket('go-firestore-rest-api.appspot.com');
  const storageService = new GoogleStorageService(bucket, storageConfig, map);


  const uploadService = new SqlUploadSerive(pool, param, manager.query, manager.exec, manager.execBatch);
  const uploads = new UploadController(log, storageService, 'media', uploadService);
  const ctx: ApplicationContext = { health, role, user, uploads };

  return ctx;
}
