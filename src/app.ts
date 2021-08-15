import {json} from 'body-parser';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import mysql from 'mysql';
import {createContext} from './init';
import {route} from './route';

dotenv.config();

const app = express();

const port = process.env.PORT;

app.use(json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'devadmin',
  password: 'abcd1234',
  database: 'backoffice5',
  multipleStatements: true,
});

const ctx = createContext(pool);
route(app, ctx);
http.createServer(app).listen(port, () => {
  console.log('Start server at port ' + port);
});
