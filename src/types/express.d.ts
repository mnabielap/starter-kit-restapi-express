import { User } from './response';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};