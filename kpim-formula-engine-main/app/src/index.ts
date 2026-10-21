import "reflect-metadata";
import dotenv from "dotenv"
dotenv.config();
import * as $log from './modules/Logger';
import {evaluateFormulaController} from "./controllers/formulaEngineController";
import {AppDataSource} from "./utils/dbUtils";
import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import {HttpError} from 'http-errors';
import {CORS_CREDENTIALS, CORS_ORIGIN, EXPRESS_PORT, SERVER_MODE} from './utils/constants';
import engineRoutes from './routes/engineRoute';
import healthRoutes from './routes/healthRoute';

async function initializeApp() {
    try {
        if (SERVER_MODE === "false") {
            await evaluateFormulaController();
        }else {
            await startServer();
        }
    } catch (error) {
        $log.error('Error initializing app:', error);
        process.exit(1)
    }
}

async function startServer() {
    const app = express();
    app.disable('x-powered-by');
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
    app.use('/api/v1', engineRoutes);
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
        $log.info('index', `Server is running on port ${EXPRESS_PORT}`);
    });
}

initializeApp();
