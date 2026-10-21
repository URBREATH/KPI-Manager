import { Router } from "express";
import * as controller from "../controllers/historicalDataController";

const historicalDataRoutes = Router();

historicalDataRoutes.post("/historical-data/query", controller.queryInfluxBucket);
historicalDataRoutes.get("/historical-data/query/date-range", controller.queryHistoricalDataByDateRange);
historicalDataRoutes.get("/historical-data/query/all", controller.retrieveAllHistoricalData);
export default historicalDataRoutes;
