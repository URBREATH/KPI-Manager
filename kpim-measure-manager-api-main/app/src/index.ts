import "reflect-metadata";
import {AppDataSource} from './utils/dbUtils';
import dotenv from "dotenv"

dotenv.config();
import express, {NextFunction, Request, Response} from 'express';
import {HttpError} from "http-errors"
import * as $log from './modules/Logger';
import {EXPRESS_PORT, CORS_CREDENTIALS, CORS_ORIGIN} from './utils/constants';
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes";
import measureRoutes from "./routes/measureRoutes";

const setCorsHeader = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
};

async function startServer() {
    const app = express();
    app.use(cors({
        credentials: CORS_CREDENTIALS == 'true',
        origin: (CORS_ORIGIN ?? `http://localhost:${EXPRESS_PORT}`).split(",").map(s => s.trim())
    }));
    app.use(setCorsHeader)
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use('/api/v1', measureRoutes);
    app.use(healthRoutes);

    app.use(function (err: Error | HttpError, req: Request, res: Response, next: NextFunction) {

        if (err instanceof HttpError) {
            return res.status(err.status).json({message: err.message})
        }

        $log.error("app", err.stack!)
        return res.status(500).json({message: err.message})
    })

    app.listen(EXPRESS_PORT, () => {
        $log.info("index", `Server is running on port ${EXPRESS_PORT}`);
    });
}

AppDataSource.initialize()
        .then(() => {
            startServer().catch(error => {
                $log.error('Error starting server:', error);
            });
        })
        .catch((error) => $log.error("Error starting DB connection", error))

