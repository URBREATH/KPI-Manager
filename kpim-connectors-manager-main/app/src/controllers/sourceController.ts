import {NextFunction, Request, Response} from 'express';
import {
  HttpMethod,
  MeasureDto,
  ResponseDTO,
} from '@he_hurbreath/kpi-models-support-main';
import {
  extractDataFromDataSource,
  setupSourceForExtraction,
} from '../services/sourceService';
import {CredentialsSource} from '../types/types';

export async function extractDataFromDataSourceController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sourceId: string = req.params.sourceId;
    const measure: MeasureDto = req.body;
    const setupSourceForExtractionResult = await setupSourceForExtraction(
      sourceId,
      measure
    );
    setupSourceForExtractionResult[0].uri = encodeURI(
      setupSourceForExtractionResult[0].uri
    );

    const credentialsSource: CredentialsSource =
      req.method === HttpMethod.POST ? 'body' : 'vault';

    const result: ResponseDTO = await extractDataFromDataSource(
      setupSourceForExtractionResult,
      credentialsSource
    );

    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}
