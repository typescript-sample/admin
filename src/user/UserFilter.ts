import {Filter} from 'express-ext';

export interface UserFilter extends Filter {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  status?: string;
  gender?: string;
  title?: string;
  position?: string;
}
