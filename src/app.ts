import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json } from 'express';
import { allow, loadTemplates, MiddlewareLogger } from 'express-ext';
import http from 'http';
import { createLogger } from 'logger-core';
import { createPool } from 'mysql';
import { PoolManager } from 'mysql-core';
import { log } from 'query-core';
import { buildTemplates, trim } from 'query-mappers';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

const app = express();
const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
app.use(allow(conf.allow), json(), cookieParser(), middleware.log);

const templates = loadTemplates(conf.template, buildTemplates, trim, ['./src/query.xml']);
const pool = createPool(conf.db);
const db = log(new PoolManager(pool), conf.log.db, logger, 'sql');
const ctx = useContext(db, logger, middleware, conf, templates);
route(app, ctx, conf.secure);
http.createServer(app).listen(conf.port, () => {
  console.log('Start server at port ' + conf.port);
});
