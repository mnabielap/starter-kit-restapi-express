import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import { db } from '../database';
import { ApiError } from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';
import * as userService from './user.service';
import * as tokenService from './token.service';

/**
 * Login with username and password
 */
export const loginUserWithEmailAndPassword = async (email: string, password: string) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password!))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Logout
 */
export const logout = async (refreshToken: string) => {
  const refreshTokenDoc = await db('tokens').where({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: 0 }).first();
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await db('tokens').where({ id: refreshTokenDoc.id }).del();
};

/**
 * Refresh auth tokens
 */
export const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user_id);
    if (!user) {
      throw new Error();
    }
    await db('tokens').where({ id: refreshTokenDoc.id }).del();
    return tokenService.generateAuthTokens(user.id);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 */
export const resetPassword = async (resetPasswordToken: string, newPassword: string) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user_id);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await db('tokens').where({ user_id: user.id, type: tokenTypes.RESET_PASSWORD }).del();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (verifyEmailToken: string) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user_id);
    if (!user) {
      throw new Error();
    }
    await db('users').where({ id: user.id }).update({ is_email_verified: 1 });
    await db('tokens').where({ user_id: user.id, type: tokenTypes.VERIFY_EMAIL }).del();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};