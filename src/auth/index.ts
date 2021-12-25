import { AuthResult, Privilege, User } from 'authen-service';
import { Request, Response } from 'express';
import { handleError, Log } from 'express-ext';

export class AuthenticationController<T extends User> {
  constructor (private log: Log, private auth: (user: T) => Promise<AuthResult>, public cookie?: boolean) {
    this.authenticate = this.authenticate.bind(this);
  }
  authenticate(req: Request, res: Response) {
    const user: T = req.body;
    if (!user.username || user.username.length === 0 || !user.password || user.password.length === 0) {
      res.status(401).end('username and password cannot be empty');
    }
    this.auth(user).then(result => {
      const account = result.user;
      if (this.cookie && account && account.token && account.tokenExpiredTime) {
        res.status(200).cookie(
          'token', account.token,
          {
            sameSite: 'strict',
            path: '/',
            expires: account.tokenExpiredTime,
            httpOnly: true,
            secure: true,
          }).json(result).end();
      } else {
        res.status(200).json(result).end();
      }
    }).catch(err => handleError(err, res, this.log));
  }
}

export class PrivilegeController {
  constructor(private log: Log, public privileges: () => Promise<Privilege[]>) {
    this.all = this.all.bind(this);
  }
  all(req: Request, res: Response) {
    this.privileges().then(result => {
      res.json(result).end();
    }).catch(err => handleError(err, res, this.log));
  }
}
