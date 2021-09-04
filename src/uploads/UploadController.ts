import e, { Request, Response } from 'express';
import {handleError} from 'express-ext';
import { StorageService } from 'google-storage';
import { FileUploads, Uploads } from 'uploads';
import { UploadSerive } from './UploadSerivce';
import { getFileName } from './utils';

export class UploadController {
  constructor(private log: (msg: string, ctx?: any) => void, private storageService: StorageService, private directory: string, private uploadService: UploadSerive) {
    this.all = this.all.bind(this);
    this.load = this.load.bind(this);
    this.upload = this.upload.bind(this);
    this.insertData = this.insertData.bind(this);
    this.remove = this.remove.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this.getImageUser = this.getImageUser.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  all(req: Request, res: Response) {
    this.uploadService.all()
      .then(roles => res.status(200).json(roles))
      .catch(err => handleError(err, res, this.log));
  }
  load(req: Request, res: Response) {
    const {id} = req.params;
    this.uploadService.load(id).then(data => {
      if (data) {
        return res.status(200).json(data.data);
      } else {
        return res.status(200).json([]);
      }
    }).catch(e => {
      return handleError(e, res, this.log);
    })
  }
  upload(req: Request, res: Response) {
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    const type = fileType.split('/')[0];
    const { id, source } = req.body;
    const name = `${id.toString()}_` + fileName;
    this.storageService
      .upload(this.directory, name, fileBuffer)
      .then((result) => {
        this.uploadService.load(id.toString()).then((upload) => {
          if (upload) {
            upload.data.push({source, type, url: result});
            this.uploadService.insert({ userId: id, data: upload.data}).then(() => res.status(200).json(result));
          } else {
            this.uploadService.insert({ userId: id, data: [{source, type, url: result}]}).then(() => res.status(200).json(result));
          }
        })
      })
      .catch((err) => {
        return handleError(err, res, this.log);
      });
  }
  remove(req: Request, res: Response) {
    const { url, userId } = req.query;
    const fileName = getFileName(url.toString());
    this.storageService
      .delete(this.directory, fileName)
      .then((result) => {
        if (result) {
          return this.uploadService.load(userId.toString()).then(upload => {
            const deleteFile = upload.data.findIndex(item => item.url === url);
            const userImageUrl = upload.data.filter(d => d.type === 'image')[0].url;
            if (deleteFile > -1 && url !== userImageUrl) {
              upload.data.splice(deleteFile, 1);
              return this.uploadService.insert({userId: userId.toString(), data: upload.data}).then(() => {
                return res.status(200).send('Delete Successful!');
              });
            } else if(deleteFile > -1 && url === userImageUrl) {
              upload.data.splice(deleteFile, 1);
              return this.uploadService.updateData(upload.data, userId.toString()).then(() => {
                return res.status(200).send('Delete Successful!');
              });
            } else {
              return res.status(400).send('File not found!');
            }
          });
        }
      })
      .catch((err) => {
        return handleError(err, res, this.log);
      });
  }
  insertData(req: Request, res: Response) {
    const uploadReq = req.body as Uploads;
    if (!uploadReq) {
      return res.status(400).send('require');
    } else {
      return this.uploadService.load(uploadReq.userId).then((upload) => {
        if (upload) {
          upload.data.push(uploadReq.data[0]);
          return this.uploadService.insert({ userId: uploadReq.userId, data: upload.data}).then(() => res.status(200).send('1'));
        } else {
          return this.uploadService.insert({ userId: uploadReq.userId, data: [uploadReq.data[0]]}).then(() => res.status(200).send('1'));
        }
      })
      .catch((err) => {
        return handleError(err, res, this.log);
      });
    }
  }
  deleteData(req: Request, res: Response) {
    const { url, userId } = req.query;
    if (url && userId) {
      return this.uploadService.load(userId.toString()).then(upload => {
        const deleteFile = upload.data.findIndex(item => item.url === url);
        if (deleteFile > -1) {
          upload.data.splice(deleteFile, 1);
          return this.uploadService.insert({userId: userId.toString(), data: upload.data}).then(() => res.status(200).send('Delete Successful!'));
        } else {
          return res.status(400).send('File not found!');
        }
      });
    } else {
      return res.status(400).send('require');
    }
  }
  getImageUser(req: Request, res: Response) {
    const {id} = req.params;
    if (!id) {
      return res.status(400).send('require');
    } else {
      return this.uploadService.getUser(id).then(r => {
        return res.status(200).json(r);
      }).catch(e => handleError(e, res, this.log));
    }
  }
  updateData(req: Request, res: Response) {
    const {data, userId} = req.body;
    const dataUpdate = data as FileUploads[];
    if (dataUpdate && userId) {
      return this.uploadService.updateData(dataUpdate, userId).then(r => {
        return res.status(200).json(r);
      }).catch(e => handleError(e, res, this.log));
    } else {
      return res.status(400).send('require');
    }
  }
 }