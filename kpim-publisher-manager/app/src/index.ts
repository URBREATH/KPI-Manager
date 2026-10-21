import "reflect-metadata";
import dotenv from "dotenv";

dotenv.config();

import express, { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import * as $log from "./modules/Logger";
import cors from "cors";

import { EXPRESS_PORT, CORS_CREDENTIALS, CORS_ORIGIN } from "./utils/constants";
import healthRoutes from "./routes/healthRoutes";
import publishRoutes from "./routes/publishRoutes";

const setCorsHeader = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
};

async function startServer() {
    const app = express();

    app.use(cors({
        credentials: CORS_CREDENTIALS === 'true',
        origin: (CORS_ORIGIN ?? `http://localhost:${EXPRESS_PORT}`)
            .split(",")
            .map(s => s.trim())
    }));

    app.use(setCorsHeader);
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    //  ROUTES
    app.use('/api/v1', publishRoutes);
    app.use(healthRoutes);

    // ERROR HANDLER
    app.use(function (err: Error | HttpError, req: Request, res: Response, next: NextFunction) {
        if (err instanceof HttpError) {
            return res.status(err.status).json({ message: err.message });
        }

        $log.error("app", err.stack!);
        return res.status(500).json({ message: err.message });
    });

    app.listen(EXPRESS_PORT, () => {
        $log.info("index", `Publisher service running on port ${EXPRESS_PORT}`);
    });
}


startServer().catch(error => {
    $log.error('Error starting server:', error);
});