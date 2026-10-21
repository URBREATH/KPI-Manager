import 'reflect-metadata';
import {AppDataSource} from './config/dbConnectorsConfig';
import dotenv from 'dotenv';
import * as $log from './modules/Logger';
import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import {HttpError} from 'http-errors';
import {
  CORS_CREDENTIALS,
  CORS_ORIGIN,
  EXPRESS_PORT,
  PROJECT_VERSION,
} from './utils/constants';
import sourceRoutes from './routes/sourceRoute';
import healthRoutes from './routes/healthRoute';
import helmet from 'helmet';

dotenv.config();

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      credentials: CORS_CREDENTIALS === 'true',
      origin: (CORS_ORIGIN ?? `http://localhost:${EXPRESS_PORT}`)
        .split(',')
        .map(s => s.trim()),
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use('/api/v1', sourceRoutes);
  app.use(healthRoutes);

  app.use(
    (
      err: Error | HttpError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (err instanceof HttpError) {
        return res.status(err.status).json({message: err.message});
      }

      $log.error('app', err.stack!);
      return res.status(500).json({message: err.message});
    }
  );

  app.listen(EXPRESS_PORT, () => {
    $log.info(
      'index',
      `Server is running on port ${EXPRESS_PORT}
      KPI-MANAGER-CONNECTORS version: ${PROJECT_VERSION}`
    );
  });
}

async function initializeApp() {
  try {
    await AppDataSource.initialize();
    await startServer();
  } catch (error) {
    $log.error('Error initializing app:', error);
    throw error;
  }
}

initializeApp();
