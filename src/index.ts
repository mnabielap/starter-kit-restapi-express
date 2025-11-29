import app from './app';
import { config } from './config/config';
import { logger } from './config/logger';
import { db } from './database';

let server: any;

const startServer = async () => {
  try {
    // Check Database Connection
    await db.raw('SELECT 1+1 as result');
    logger.info(`Connected to Database (${config.db.client})`);

    // Run Migrations (Optional: typically run via command line, but can be auto-run here)
    if (config.env === 'development') {
      await db.migrate.latest();
      logger.info('Migrations are up to date');
    }

    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to connect to database', error);
    process.exit(1);
  }
};

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});