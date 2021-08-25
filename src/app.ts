import {json,urlencoded} from 'body-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import http from 'http';
import {createContext} from './init';
import { Pool } from 'pg';
import {route} from './route';

dotenv.config();

const app = express();

const port = process.env.PORT;
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'));

export const pool = new Pool ({
  user: 'postgres',
  host: 'localhost',
  password: '1234',
  database: 'backoffice5',
  port: 5432
});

pool.connect().then( () => {
  const ctx = createContext(pool);
  route(app, ctx);
  http.createServer(app).listen(port, () => {
    console.log('Start server at port ' + port);
  });
  console.log('Connected successfully to PostgreSQL.');
})
.catch(e => {
  console.error('Failed to connect to PostgreSQL.', e.message, e.stack);
});