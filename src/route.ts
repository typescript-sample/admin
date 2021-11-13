import {Application} from 'express';
import multer from 'multer';
import {ApplicationContext} from './context';

export function route(app: Application, ctx: ApplicationContext): void {
  const upload = multer();

  app.get('/health', ctx.health.check);

  app.post('/authenticate', ctx.auth.authenticate);

  app.get('/roles', ctx.role.all);
  app.post('/roles/search', ctx.role.search);
  app.get('/roles/search', ctx.role.search);
  app.get('/roles/:id', ctx.role.load);
  app.post('/roles', ctx.role.create);
  app.put('/roles/:id', ctx.role.update);
  app.patch('/roles/:id', ctx.role.patch);
  app.delete('/roles/:id', ctx.role.delete);

  app.post('/users/search', ctx.user.search);
  app.get('/users/search', ctx.user.search);
  app.get('/users/:id', ctx.user.load);
  app.post('/users', ctx.user.create);
  app.put('/users/:id', ctx.user.update);
  app.patch('/users/:id', ctx.user.patch);
  app.delete('/users/:id', ctx.user.delete);

  app.get('/uploads', ctx.uploads.all);
  app.get('/uploads/:id', ctx.uploads.load);
  app.post('/uploads', upload.single('file'), ctx.uploads.upload);
  app.post('/uploads/youtube', ctx.uploads.insertData);
  app.delete('/uploads', ctx.uploads.remove);
  app.delete('/uploads/youtube', ctx.uploads.deleteData);

  app.patch('/uploads', ctx.uploads.updateData);
  app.get('/image/users/:id', ctx.uploads.getImageUser);
}
