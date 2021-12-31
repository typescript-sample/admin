import { json } from 'body-parser';
import { merge } from 'config-plus';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { MiddlewareLogger } from 'express-ext';
import * as fs from 'fs';
import http from 'http';
import { createLogger } from 'logger-core';
import { createPool } from 'mysql';
import { PoolManager } from 'mysql-core';
import { buildTemplates, correctXml, Template, TemplateManager } from 'query-templates';
import { config, env } from './config';
import { useContext } from './context';
import { route } from './route';

dotenv.config();
const conf = merge(config, process.env, env, process.env.ENV);

export function param(i: number): string {
  return '$' + i;
}
const text = fs.readFileSync('./src/query.xml', 'utf8');
const templateManager = new TemplateManager();
const obj = {
  q: 'Peter',
  // name: 'Parker',
  username: 'Stanlee',
  status: ['A', 'B', 'C'],
  test: {
    status: '1',
    password: 'xxx'
  }
};
const templates2 = buildTemplates([text], correctXml);
const t = templates2.get('test');
if (t) {
  const sql2 = templateManager.build(t, obj, param);
  console.log('t2 ' + sql2.query + JSON.stringify(sql2.params));
}

const app = express();
const logger = createLogger(conf.log);
const middleware = new MiddlewareLogger(logger.info, conf.middleware);
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Authorization, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  next();
});
app.use(json(), cookieParser(), middleware.log);

let templates: Map<string, Template>|undefined;
if (conf.template) {
  const mapper = fs.readFileSync('./src/query.xml', 'utf8');
  templates = buildTemplates([mapper], correctXml);
}
const pool = createPool(conf.db);
const db = new PoolManager(pool);
const ctx = useContext(db, logger, middleware, conf, templates);
route(app, ctx, conf.secure);
http.createServer(app).listen(conf.port, () => {
  console.log('Start server at port ' + conf.port);
});
