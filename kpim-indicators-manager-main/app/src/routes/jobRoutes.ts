import { Router } from "express";
import * as controller from "../controllers/jobController";

const jobRoutes = Router();

jobRoutes.post("/formula/preview", controller.previewFormulaController);
jobRoutes.post("/cronjob", controller.createCronJobController);
jobRoutes.delete("/cronjob/:id", controller.deleteCronJobController);
jobRoutes.patch("/cronjob/:id", controller.executionStateCronJobController);

export default jobRoutes;
