import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import { db } from '../database';
import { ApiError } from '../utils/ApiError';
import { User, PaginatedResult } from '../types/response';

/**
 * Check if email is taken
 */
export const isEmailTaken = async (email: string, excludeUserId?: number): Promise<boolean> => {
  const query = db('users').where({ email });
  if (excludeUserId) {
    query.whereNot({ id: excludeUserId });
  }
  const user = await query.first();
  return !!user;
};

/**
 * Create a user
 */
export const createUser = async (userBody: any): Promise<Omit<User, 'password'>> => {
  if (await isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  
  const hashedPassword = await bcrypt.hash(userBody.password, 8);
  const userToCreate = {
    ...userBody,
    password: hashedPassword,
  };

  const [id] = await db('users').insert(userToCreate).returning('id');
  const userId = typeof id === 'object' ? (id as any).id : id;

  const user = await getUserById(userId);
  if (!user) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'User creation failed');
  
  return user;
};

/**
 * Get user by id
 */
export const getUserById = async (id: number): Promise<Omit<User, 'password'> | undefined> => {
  return db('users').select('id', 'name', 'email', 'role', 'is_email_verified', 'created_at', 'updated_at').where({ id }).first();
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  return db('users').where({ email }).first();
};

/**
 * Query users
 */
export const queryUsers = async (filter: any, options: any): Promise<PaginatedResult<Omit<User, 'password'>>> => {
  const { name, role } = filter;
  const { sortBy, limit = 10, page = 1 } = options;
  const offset = (page - 1) * limit;

  // Base Query
  const query = db('users').select('id', 'name', 'email', 'role', 'is_email_verified', 'created_at');

  if (name) query.where('name', 'like', `%${name}%`);
  if (role) query.where({ role });

  // Count Query (Cloning to avoid modifying main query)
  const countQuery = query.clone().clearSelect().count<{ count: number }[]>('* as count').first();
  const totalResult = await countQuery;
  const totalResults = totalResult ? Number(totalResult.count) : 0;

  // Sorting
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    if (['asc', 'desc'].includes(order) && ['name', 'role', 'created_at'].includes(field)) {
      query.orderBy(field, order);
    }
  } else {
    query.orderBy('created_at', 'desc');
  }

  // Pagination
  query.limit(limit).offset(offset);

  const results = await query;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Update user by id
 */
export const updateUserById = async (userId: number, updateBody: any): Promise<Omit<User, 'password'>> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (updateBody.email && (await isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const updatedData = { ...updateBody };
  if (updatedData.password) {
    updatedData.password = await bcrypt.hash(updatedData.password, 8);
  }

  await db('users').where({ id: userId }).update(updatedData);

  const updatedUser = await getUserById(userId);
  return updatedUser!;
};

/**
 * Delete user by id
 */
export const deleteUserById = async (userId: number): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await db('users').where({ id: userId }).del();
};