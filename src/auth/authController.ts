import { Request, Response } from 'express';
import { handleError } from 'express-ext';
import { AuthModal } from './auth';

export class AuthController {
  constructor (private auth: (username: string, password: string) => Promise<AuthModal>, private log: (msg: string, ctx?: any) => void) {
    this.authenticate = this.authenticate.bind(this);
  }
  authenticate(req: Request, res: Response) {
    const {username, password} = req.body;
    if (!username || !password) {
      res.status(401).send({message: 'username and password cannot be empty'});
    }
    this.auth(username, password).then(result => {
      res.status(200).cookie(
        'token', result.user.token,
        {
          sameSite: 'strict',
          path: '/',
          expires: result.user.tokenExpiredTime,
          httpOnly: true,
          secure: true,
        }
      ).send(result);
    }).catch(err => handleError(err, res, this.log));
  }
}
