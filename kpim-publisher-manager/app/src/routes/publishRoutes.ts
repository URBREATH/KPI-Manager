import {Router} from "express";
import { publishKpi, publishDataset, publishFrostServer, getOrionKpiStatusController, deleteKpiFromOrionController } from '../controllers/publisherController';



const publishRoutes = Router();



publishRoutes.post('/kpi/publish/:id', publishKpi);
publishRoutes.get('/kpi/orion/:id/status', getOrionKpiStatusController);
publishRoutes.delete('/kpi/orion/:id', deleteKpiFromOrionController);
publishRoutes.post('/dataset/publish',publishDataset)
publishRoutes.post('/frostserver/publish/:id',publishFrostServer)


export default publishRoutes;