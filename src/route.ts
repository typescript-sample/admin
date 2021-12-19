import { Application } from 'express';
import { read, write } from 'security-express';
import { ApplicationContext } from './context';

export function route(app: Application, ctx: ApplicationContext, isSecure: boolean): void {
  app.get('/health', ctx.health.check);
  app.patch('/log', ctx.log.config);
  app.patch('/middleware', ctx.middleware.config);

  if (isSecure) {
    secure(app, ctx);
  } else {
    insecure(app, ctx);
  }
}

export function insecure(app: Application, ctx: ApplicationContext) {
  app.get('/roles', ctx.role.search);
  app.post('/roles/search', ctx.role.search);
  app.get('/roles/search', ctx.role.search);
  app.get('/roles/:id', ctx.role.load);
  app.post('/roles', ctx.role.create);
  app.put('/roles/:id', ctx.role.update);
  app.patch('/roles/:id', ctx.role.patch);
  app.delete('/roles/:id', ctx.role.delete);

  app.get('/users', ctx.user.all);
  app.post('/users/search', ctx.user.search);
  app.get('/users/search', ctx.user.search);
  app.get('/users/:id', ctx.user.load);
  app.post('/users', ctx.user.create);
  app.put('/users/:id', ctx.user.update);
  app.patch('/users/:id', ctx.user.patch);
  app.delete('/users/:id', ctx.user.delete);
}

export function secure(app: Application, ctx: ApplicationContext) {
  const readRole = ctx.authorize('role', read);
  const writeRole = ctx.authorize('role', write);
  app.put('/roles/:id/assign', writeRole, ctx.role.assign);
  app.get('/roles', readRole, ctx.role.search);
  app.post('/roles/search', readRole, ctx.role.search);
  app.get('/roles/search', readRole, ctx.role.search);
  app.get('/roles/:id', readRole, ctx.role.load);
  app.post('/roles', writeRole, ctx.role.create);
  app.put('/roles/:id', writeRole, ctx.role.update);
  app.patch('/roles/:id', writeRole, ctx.role.patch);
  app.delete('/roles/:id', writeRole, ctx.role.delete);

  const readUser = ctx.authorize('user', read);
  const writeUser = ctx.authorize('user', write);
  app.get('/users', readUser, ctx.user.all);
  app.post('/users/search', readUser, ctx.user.search);
  app.get('/users/search', readUser, ctx.user.search);
  app.get('/users/:id', readUser, ctx.user.load);
  app.post('/users', writeUser, ctx.user.create);
  app.put('/users/:id', writeUser, ctx.user.update);
  app.patch('/users/:id', writeUser, ctx.user.patch);
  app.delete('/users/:id', writeUser, ctx.user.delete);
}
