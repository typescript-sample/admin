import { json } from 'body-parser';
import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express, {Request, Response} from 'express';
import { MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import mysql from 'mysql';
import { PoolManager } from 'mysql-core';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  // res.header('Access-Control-Allow-Headers', "*");
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});
app.use(json(), middleware.log);

const pool = mysql.createPool(conf.db);

pool.getConnection((err, conn) => {
  if (err) {
    console.error('Failed to connect to MySQL.', err.message, err.stack);
  } else if (conn) {
    console.log('Connected successfully to MySQL.');
    const db = new PoolManager(pool);
    const ctx = useContext(db, logger, middleware, conf);
    route(app, ctx, conf.secure);
    http.createServer(app).listen(conf.port, () => {
      console.log('Start server at port ' + conf.port);
    });
  }
});
