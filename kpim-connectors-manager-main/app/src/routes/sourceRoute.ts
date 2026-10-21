import {Router} from 'express';
import * as controller from '../controllers/sourceController';

const sourceRoutes = Router();

sourceRoutes.get(
  '/measures/fetch/:sourceId',
  controller.extractDataFromDataSourceController
);

sourceRoutes.post(
  '/measures/fetch',
  controller.extractDataFromDataSourceController
);

export default sourceRoutes;
