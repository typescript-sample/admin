import {SearchModel} from 'express-ext';

export interface UserSM extends SearchModel {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  gender?: string;
  title?: string;
  position?: string;
}
