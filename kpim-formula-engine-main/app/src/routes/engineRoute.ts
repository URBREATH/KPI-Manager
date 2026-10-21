import {Router} from 'express';
import * as controller from '../controllers/formulaEngineController';

const engineRoutes = Router();

engineRoutes.post(
        '/formula/preview',
        controller.previewFormulaController
);

export default engineRoutes;
