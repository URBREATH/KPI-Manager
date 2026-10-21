import { Router } from "express";
import * as controller from "../controllers/kpiController";

const kpiRoutes = Router();

kpiRoutes.get("/public/kpi", controller.getPublicKpisController);
kpiRoutes.get("/public/kpi/:token", controller.getPublicKpiController);
kpiRoutes.post("/kpi/public-link/:id", controller.createPublicKpiLinkController);
kpiRoutes.delete("/kpi/public-link/:id", controller.revokePublicKpiLinkController);
kpiRoutes.patch("/kpi/orion-publication/:id", controller.saveOrionPublicationController);
kpiRoutes.delete("/kpi/orion-publication/:id", controller.clearOrionPublicationController);
kpiRoutes.get("/kpi", controller.getKpiController);
kpiRoutes.post("/kpi", controller.createKpiController);
kpiRoutes.post("/kpi/clone", controller.cloneKpiController);
kpiRoutes.put("/kpi/:id", controller.updateKpiController);
kpiRoutes.delete("/kpi/:id", controller.deleteKpiController);
kpiRoutes.get("/kpi/:id", controller.getOneKpiController);
kpiRoutes.get("/unit-measures", controller.getUnitMeasuresController);
kpiRoutes.put("/kpi/last-value/:id", controller.updateLastValueKpiController);
kpiRoutes.patch("/kpi/measures/:id", controller.handleMeasureOrKpiDeletion);
kpiRoutes.post("/kpi/:id/share", controller.shareKpiController)
kpiRoutes.post("/kpi/compare/unit-measures", controller.compareKpiController);



export default kpiRoutes;
