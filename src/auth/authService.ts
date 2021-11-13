import {AuthModal} from './auth';

export interface AuthService {
  authenticate(username: string, password: string): Promise<AuthModal>;
}
