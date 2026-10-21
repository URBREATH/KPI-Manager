import express, { Router } from 'express';
import * as middlewareController from '../controllers/middlewareController';
import * as contextController from '../controllers/contextController';
const middlewareRouter: Router = express.Router();
import { protect } from '../middlewares/AuthMiddleware';

middlewareRouter.get("/public/kpi", middlewareController.handlePublicKpisRequest);
middlewareRouter.get("/public/kpi/:token", middlewareController.handlePublicKpiRequest);
middlewareRouter.post("/:tenantId/kpi/public-link/:id", protect, middlewareController.handleKpiPublicLinkRequest);
middlewareRouter.delete("/:tenantId/kpi/public-link/:id", protect, middlewareController.handleKpiPublicLinkRequest);
middlewareRouter.patch("/:tenantId/kpi/orion-publication/:id", protect, middlewareController.handleSaveOrionPublicationRequest);
middlewareRouter.delete("/:tenantId/kpi/orion-publication/:id", protect, middlewareController.handleClearOrionPublicationRequest);

middlewareRouter.get("/:tenantId/kpi", protect, middlewareController.handleKpiRequest);
middlewareRouter.get("/:tenantId/kpi/orion/:id/status", protect, middlewareController.handleOrionKpiStatusRequest);
middlewareRouter.delete("/:tenantId/kpi/orion/:id", protect, middlewareController.handleDeleteOrionKpiRequest);
middlewareRouter.post("/:tenantId/kpi", protect, middlewareController.handleKpiRequest);
middlewareRouter.post("/:tenantId/kpi/clone", protect, middlewareController.handleCloneKpi);
middlewareRouter.put("/:tenantId/kpi/:id", protect, middlewareController.handleKpiRequest);
middlewareRouter.delete("/:tenantId/kpi/:id", protect, middlewareController.handleKpiRequest);
middlewareRouter.get("/:tenantId/kpi/:id", protect, middlewareController.handleKpiRequest);
middlewareRouter.post("/:tenantId/kpi/compare/unit-measures", protect, middlewareController.handleKpiRequest);

middlewareRouter.post("/:tenantId/formula/preview", protect, middlewareController.handleFormulaPreview);

middlewareRouter.post("/:tenantId/cronjob", protect, middlewareController.handleJobRequest);
middlewareRouter.patch("/:tenantId/cronjob/:id", protect, middlewareController.handleJobRequest);
middlewareRouter.delete("/:tenantId/cronjob/:id", protect, middlewareController.handleJobRequest);

middlewareRouter.get("/:tenantId/measures", protect, middlewareController.handleMeasureRequest);
middlewareRouter.get("/:tenantId/measures/:id", protect, middlewareController.handleMeasureRequest);
middlewareRouter.put("/:tenantId/measures/:id", protect, middlewareController.handleMeasureRequest);
middlewareRouter.delete("/:tenantId/measures/:id", protect, middlewareController.handleMeasureRequest);
middlewareRouter.post("/:tenantId/measures", protect, middlewareController.handleMeasureRequest);
middlewareRouter.post("/:tenantId/measures/clone", protect, middlewareController.handleCloneMeasure);
middlewareRouter.post("/:tenantId/measures/fetch", protect, middlewareController.handleMeasurePreview);

middlewareRouter.get("/:tenantId/measure-types", middlewareController.getMeasureTypes);
middlewareRouter.get("/:tenantId/unit-measures", middlewareController.getUnitMeasure)

middlewareRouter.get("/:tenantId/historical-data/query/all", middlewareController.handleHistoricalDataRequest);
middlewareRouter.get("/:tenantId/historical-data/query/date-range", middlewareController.handleHistoricalDataRequest);


middlewareRouter.get("/:tenantId/users", protect, middlewareController.getUserListController)

middlewareRouter.get("/:tenantId/contexts", protect, contextController.getContextsController);
middlewareRouter.get("/:tenantId/contexts/:id", protect, contextController.getContextByIdController);
middlewareRouter.delete("/:tenantId/contexts/:id", protect, contextController.deleteContextController);
middlewareRouter.post("/:tenantId/contexts", protect, contextController.createContextController);
middlewareRouter.patch("/:tenantId/contexts/:id", protect, contextController.updateContextController);
middlewareRouter.get("/:tenantId/users/contexts", protect, contextController.getUserContextsController);

middlewareRouter.post("/:tenantId/kpi/:id/share", protect, middlewareController.handleKpiShareRequest);
middlewareRouter.post("/:tenantId/measures/:id/share/", protect, middlewareController.handleMeasureShareRequest);


//API PER CHIAMARE IL MICROSERVIZIO PUBLISHER (GESTISCE LA PUBBLICAZIONE DEL KPI SU ORION, FROST SERVER)
middlewareRouter.post("/:tenantId/kpi/publish/:id",protect,middlewareController.handleKpiPublishRequest);
middlewareRouter.post("/:tenantId/dataset/publish",protect,middlewareController.handleDatasetPublishRequest);
middlewareRouter.post("/:tenantId/frostserver/publish/:id",protect,middlewareController.handleFrostServerPublishRequest);




export default middlewareRouter;
