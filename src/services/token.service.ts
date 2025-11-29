import jwt, { JwtPayload } from 'jsonwebtoken';
import moment from 'moment';
import httpStatus from 'http-status';
import { db } from '../database';
import { config } from '../config/config';
import { tokenTypes } from '../config/tokens';
import { ApiError } from '../utils/ApiError';
import { Token } from '../types/response';
import * as userService from './user.service';

/**
 * Generate token
 */
export const generateToken = (userId: number, expires: moment.Moment, type: string, secret = config.jwt.secret): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token to database
 */
export const saveToken = async (token: string, userId: number, expires: moment.Moment, type: string, blacklisted = 0): Promise<Token> => {
  const tokenDoc = {
    token,
    user_id: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  };
  
  // Knex SQLite returns [id], Postgres returns object/id depending on setup.
  // We use standard insert and then fetch for compatibility.
  const [id] = await db('tokens').insert(tokenDoc).returning('id');
  
  const tokenId = typeof id === 'object' ? (id as any).id : id;

  const savedToken = await db('tokens').where({ id: tokenId }).first();
  if (!savedToken) throw new Error('Token save failed');
  
  return savedToken;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 */
export const verifyToken = async (token: string, type: string): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
  
  // Fix: TypeScript defines 'sub' as string | undefined. 
  // We explicitly convert it to Number because our DB uses numbers for IDs.
  const userId = Number(payload.sub);

  if (isNaN(userId)) {
    throw new Error('Invalid token payload');
  }

  const tokenDoc = await db('tokens').where({ token, type, user_id: userId, blacklisted: 0 }).first();
  
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens (access and refresh)
 */
export const generateAuthTokens = async (userId: number) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(userId, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(userId, refreshTokenExpires, tokenTypes.REFRESH);
  
  await saveToken(refreshToken, userId, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 */
export const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 */
export const generateVerifyEmailToken = async (userId: number): Promise<string> => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(userId, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, userId, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};