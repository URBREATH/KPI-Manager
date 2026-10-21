import {Router} from "express";
import * as controller from "../controllers/ProbeController";

const probeRoutes = Router();

probeRoutes.get("/health", controller.checkHealth);
export default probeRoutes;
