import dotenv from "dotenv"
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from "http-errors"
import * as $log from './modules/Logger';
import { EXPRESS_PORT, CORS_CREDENTIALS, CORS_ORIGIN, SECRET_KEY_SESSION } from './utils/constants';
import cors from 'cors';
import middlewareRoutes from "./routes/middlewareRoutes";
import authRoutes from "./routes/auth";
import session from "express-session";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
async function startServer() {
  const app = express();
  app.use(cors({
    credentials: CORS_CREDENTIALS == 'true',
    origin: (CORS_ORIGIN ?? `http://localhost:${EXPRESS_PORT}`).split(",").map(s => s.trim())
  }));

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    secret: SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: "auto", httpOnly: true }
  }))

  function serveApiDocs(yamlPath) {
    return (req: any, res: any, next: any) => {
      const apiDocs = YAML.load(yamlPath);
      return swaggerUi.setup(apiDocs)(req, res, next);
    };
  }

  app.use('/api-docs/indicators', swaggerUi.serve, serveApiDocs('./docs/indicators-manager-api.yml'));
  app.use('/api-docs/measure', swaggerUi.serve, serveApiDocs('./docs/measure-manager-api.yml'));
  app.use("/api/v1", middlewareRoutes)
  app.use('/api/v1', authRoutes);

  app.use(function (err: Error | HttpError, req: Request, res: Response, next: NextFunction) {

    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message })
    }

    $log.error("app", err.stack!)
    return res.status(500).json({ message: err.message })
  })

  app.listen(EXPRESS_PORT, () => {
    $log.info("index", `Server is running on port ${EXPRESS_PORT}`);
  });
}

async function initializeApp() {
  try {
    await startServer();
  } catch (error) {
    $log.error("index.ts", "Error initializing app:" + error);
    throw error;
  }
}

initializeApp();

