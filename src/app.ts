import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import httpStatus from 'http-status';
import { config } from './config/config';
import { morganHandler } from './config/morgan';
import { authLimiter } from './middlewares/rateLimiter';
import { errorConverter, errorHandler } from './middlewares/error';
import { ApiError } from './utils/ApiError';
import routes from './routes/v1';

const app = express();

if (config.env !== 'test') {
  app.use(morganHandler);
}

// Set security HTTP headers
// Configured to allow Cloudflare CDN for Swagger UI
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
    },
  },
}));

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Gzip compression
app.use(compression());

// Enable CORS
app.use(cors());
app.options('*', cors());

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// --- Redirect root to API documentation ---
app.get('/', (req, res) => {
  res.redirect('/v1/docs');
});

// v1 api routes
app.use('/v1', routes);

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

export default app;