import { json } from 'body-parser';
import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { loadTemplates, MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import { createPool } from 'mysql';
import { PoolManager } from 'mysql-core';
import { log } from 'query-core';
import { buildTemplates, trim } from 'query-templates';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', conf.allow.origin);
  res.header('Access-Control-Allow-Credentials', conf.allow.credentials);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});
app.use(json(), cookieParser(), middleware.log);

const templates = loadTemplates(conf.template, buildTemplates, trim);
const pool = createPool(conf.db);
const db = log(new PoolManager(pool), conf.log.db, logger, 'sql');
const ctx = useContext(db, logger, middleware, conf, templates);
route(app, ctx, conf.secure);
http.createServer(app).listen(conf.port, () => {
  console.log('Start server at port ' + conf.port);
});
