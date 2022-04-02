import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { json, NextFunction } from 'express';
import { Request, Response } from 'express';
import { loadTemplates, MiddlewareLogger, start } from 'express-ext';
import { createLogger } from 'logger-core';
import { createPool } from 'mysql';
import { PoolManager } from 'mysql-core';
import { log } from 'query-core';
import { buildTemplates, trim } from 'query-mappers';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';
export interface AccessConfig {
  origin?: string | string[];
  credentials?: string | string[];
  methods?: string | string[];
  headers: number | string | ReadonlyArray<string>;
}
export type AccessControlAllowConfig = AccessConfig;
export function allow(access: AccessConfig): (req: Request, res: Response, next: NextFunction) => void {
  const ao = access.origin;
  if (typeof ao === 'string') {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', access.origin);
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  } else if (Array.isArray(ao) && ao.length > 0) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
      }
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  return (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Credentials', access.credentials);
    res.header('Access-Control-Allow-Methods', access.methods);
    res.setHeader('Access-Control-Allow-Headers', access.headers);
    next();
  };
}

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
start(app, conf);
