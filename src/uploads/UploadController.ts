import { Request, Response } from 'express';
import { handleError } from 'express-ext';
import { FileUploads, Upload } from './Upload';
import { UploadSerive } from './UploadSerivce';
import { getFileName } from './utils';

export class UploadController {
  constructor(private log: (msg: string, ctx?: any) => void, private uploadService: UploadSerive) {
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
    const { id } = req.params;
    this.uploadService.load(id).then(data => {
      if (data) {
        return res.status(200).json(data.data);
      } else {
        return res.status(200).json([]);
      }
    }).catch(e => {
      return handleError(e, res, this.log);
    });
  }
  upload(req: Request, res: Response) {
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    const type = fileType.split('/')[0];
    const { id, source } = req.body;
    const name = `${id.toString()}_` + fileName;
    this.uploadService.uploadFile(id, source, type, name, fileBuffer).then(result =>
       res.status(200).json(result)
    ).catch(e =>  handleError(e, res, this.log));
  }
  remove(req: Request, res: Response) {
    const { url, userId } = req.query;
    const fileName = getFileName(url.toString());
    this.uploadService.deleteFile(userId.toString(), fileName, url.toString()).then(result =>
      res.status(200).json(result)
    ).catch(e =>  handleError(e, res, this.log));
  }
  insertData(req: Request, res: Response) {
    const uploadReq = req.body as Upload;
    if (!uploadReq) {
      return res.status(400).send('require');
    } else {
      this.uploadService.insertData(uploadReq).then(result =>
        res.status(200).json(result)).
        catch(e =>  handleError(e, res, this.log));
    }
  }
  deleteData(req: Request, res: Response) {
    const { url, userId } = req.query;
    if (url && userId) {
      this.uploadService.deleteData(userId.toString(), url.toString())
        .then(result => res.status(200).json(result))
        .catch(e => handleError(e, res, this.log));
    } else {
      return res.status(400).send('require');
    }
  }
  getImageUser(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('require');
    } else {
      return this.uploadService.getUser(id).then(r => {
        return res.status(200).json(r);
      }).catch(e => handleError(e, res, this.log));
    }
  }
  updateData(req: Request, res: Response) {
    const { data, userId } = req.body;
    const dataUpdate = data as FileUploads[];
    if (dataUpdate && userId) {
      return this.uploadService.updateData(userId, dataUpdate).then(r => {
        return res.status(200).json(r);
      }).catch(e => handleError(e, res, this.log));
    } else {
      return res.status(400).send('require');
    }
  }
}
