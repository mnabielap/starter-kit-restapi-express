import morgan from 'morgan';
import { config } from './config';
import { logger } from './logger';

const stream = {
  write: (message: string) => logger.info(message.trim()),
};

const skip = () => {
  const env = config.env || 'development';
  return env !== 'development';
};

export const morganHandler = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);