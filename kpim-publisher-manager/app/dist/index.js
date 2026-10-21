"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("reflect-metadata");
const dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = tslib_1.__importDefault(require("express"));
const http_errors_1 = require("http-errors");
const $log = tslib_1.__importStar(require("./modules/Logger"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const constants_1 = require("./utils/constants");
const healthRoutes_1 = tslib_1.__importDefault(require("./routes/healthRoutes"));
const publishRoutes_1 = tslib_1.__importDefault(require("./routes/publishRoutes"));
const setCorsHeader = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, GET, OPTIONS, DELETE");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
};
async function startServer() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        credentials: constants_1.CORS_CREDENTIALS === 'true',
        origin: (constants_1.CORS_ORIGIN ?? `http://localhost:${constants_1.EXPRESS_PORT}`)
            .split(",")
            .map(s => s.trim())
    }));
    app.use(setCorsHeader);
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    //  ROUTES
    app.use('/api/v1', publishRoutes_1.default);
    app.use(healthRoutes_1.default);
    // ERROR HANDLER
    app.use(function (err, req, res, next) {
        if (err instanceof http_errors_1.HttpError) {
            return res.status(err.status).json({ message: err.message });
        }
        $log.error("app", err.stack);
        return res.status(500).json({ message: err.message });
    });
    app.listen(constants_1.EXPRESS_PORT, () => {
        $log.info("index", `Publisher service running on port ${constants_1.EXPRESS_PORT}`);
    });
}
startServer().catch(error => {
    $log.error('Error starting server:', error);
});
