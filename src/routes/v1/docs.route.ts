import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { version } from '../../../package.json';

const router = express.Router();

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Express API Starter Kit',
    version,
    description: 'A full-featured REST API starter kit built with Express, Knex (SQLite/PG), and Zod.',
    license: {
      name: 'MIT',
      url: 'https://github.com/mnabielap/starter-kit-restapi-express',
    },
  },
  servers: [
    {
      url: '/v1',
      description: 'Current Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition: swaggerDef,
  apis: [
    path.join(__dirname, '*.ts'), 
    path.join(__dirname, '*.js')
  ], 
};

const specs = swaggerJsdoc(options);

const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css';
const JS_URL_BUNDLE = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.min.js';
const JS_URL_PRESET = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js';

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl: CSS_URL,
    customJs: [JS_URL_BUNDLE, JS_URL_PRESET],
  })
);

export default router;