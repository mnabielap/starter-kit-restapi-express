import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Combine all relevant request parts into a single object
    const objectToValidate = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    // 2. Validate using Zod
    const result = schema.parse(objectToValidate);

    // 3. Assign validated & sanitized data back to the request
    if (result.body) req.body = result.body;
    if (result.query) req.query = result.query;
    if (result.params) req.params = result.params;

    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.errors.map((details) => {
        const path = details.path.join('.'); 
        return `${path}: ${details.message}`;
      }).join(', ');
      
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }
    return next(error);
  }
};