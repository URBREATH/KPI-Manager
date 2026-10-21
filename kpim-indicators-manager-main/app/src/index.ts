import "reflect-metadata";
import { AppDataSource, createOrionPublicationTable } from './utils/dbUtils';
import dotenv from "dotenv";
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from "http-errors";
import * as $log from './modules/Logger';
import { EXPRESS_PORT, CORS_CREDENTIALS, CORS_ORIGIN, CREATE_ORION_PUBLICATION_TABLE } from './utils/constants';
import cors from 'cors';
import healthRoutes from "./routes/healthRoutes";
import kpiRoutes from "./routes/kpiRoutes";
import jobRoutes from "./routes/jobRoutes";
import { consumerInit, producerInit } from "./services/kafkaClient";
import { Consumer } from "kafkajs";


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

    app.use('/api/v1', kpiRoutes);
    app.use('/api/v1', jobRoutes);
    app.use(healthRoutes);

    app.use(function (err: Error | HttpError, req: Request, res: Response, next: NextFunction) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ message: err.message });
        }

        $log.error("app", err.stack ?? err.message);
        return res.status(500).json({ message: err.message });
    });

    app.listen(EXPRESS_PORT, () => {
        $log.info("index", `Server is running on port ${EXPRESS_PORT}`);
    });
}

async function initializeApp() {
    try {
        await AppDataSource.initialize();
        if (CREATE_ORION_PUBLICATION_TABLE) {
            await createOrionPublicationTable();
            $log.info('index', 'Orion publication metadata table migration completed');
        }
        await startServer();
        await producerInit();
        const consumerInstance: Consumer | undefined = await consumerInit();
        if (!consumerInstance) throw new Error("Error initializing consumer");
    } catch (error) {
        $log.error('Error initializing app:', error);
        throw error;
    }
}

initializeApp();
