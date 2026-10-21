import dotenv from "dotenv"
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from "http-errors"
import * as $log from './modules/Logger';
import { EXPRESS_PORT, CORS_CREDENTIALS, CORS_ORIGIN } from './utils/constants';
import cors from 'cors';
import probeRoutes from "./routes/ProbeRoutes";
import historicalDataRoutes from "./routes/HistoricalDataRoutes";

async function startServer() {
    const app = express();
    app.use(cors({
        credentials: CORS_CREDENTIALS == 'true',
        origin: (CORS_ORIGIN ?? `http://localhost:${EXPRESS_PORT}`).split(",").map(s => s.trim())
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use('/api/v1', historicalDataRoutes);
    app.use(probeRoutes);

    app.use(function (err: Error | HttpError, req: Request, res: Response, next: NextFunction) {

        if (err instanceof HttpError) {
            return res.status(err.status).json({ message: err.message })
        }

        $log.error("app", err.stack as string)
        return res.status(400).json({ message: err.message })
    })

    app.listen(EXPRESS_PORT, () => {
        $log.info("index", `Server is running on port ${EXPRESS_PORT}`);
    });
}

startServer();

