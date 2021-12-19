import { json } from 'body-parser';
import { merge } from 'config-plus';
import dotenv from 'dotenv';
import express from 'express';
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
