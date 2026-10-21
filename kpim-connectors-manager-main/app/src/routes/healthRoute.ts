import {Router} from 'express';
import * as controller from '../controllers/healthController';

const healthRoutes = Router();

healthRoutes.get('/health', controller.checkHealth);

export default healthRoutes;
