import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/config';
import { roleRights } from '../config/roles';
import { db } from '../database';
import { tokenTypes } from '../config/tokens';

export const auth = (...requiredRights: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  return new Promise(async (resolve, reject) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
      }

      const token = authHeader.split(' ')[1];
      const payload: any = jwt.verify(token, config.jwt.secret);

      if (payload.type !== tokenTypes.ACCESS) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type');
      }

      // Check if user exists in DB
      const user = await db('users').where({ id: payload.sub }).first();
      
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
      }

      (req as any).user = user;

      // Role Based Access Control
      if (requiredRights.length) {
        const userRights = roleRights.get(user.role) || [];
        const hasRequiredRights = requiredRights.every((right) => userRights.includes(right));
        
        if (!hasRequiredRights && req.params.userId !== String(user.id)) {
          throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
        }
      }

      resolve(next());
    } catch (err) {
      reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  })
  .catch((err) => next(err));
};