import {Router} from "express";
import * as controller from "../controllers/measureController";

const measureRoutes = Router();

measureRoutes.get("/measures", controller.getMeasuresController);
measureRoutes.post("/measures", controller.createMeasureController);
measureRoutes.put("/measures/:id", controller.updateMeasureController);
measureRoutes.delete("/measures/:id", controller.deleteMeasuresController);
measureRoutes.get("/measures/:id", controller.getOneMeasureController);
measureRoutes.get("/measure-types", controller.getMeasureTypeController)
measureRoutes.post("/measures/clone", controller.cloneMeasureController)
measureRoutes.get("/sources/:id", controller.getOneSourceByIdController)
measureRoutes.post("/measures/:id/share", controller.addEditorsToMeasureController)

export default measureRoutes;
