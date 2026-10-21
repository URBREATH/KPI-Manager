import {
  createResponseDto,
  MeasureDto,
  MeasureType,
  ResponseDTO,
  SourceDto,
} from '@he_hurbreath/kpi-models-support-main';
import {createMessageCompletedTask} from '../utils/messageUtils';
import {retriveDataSourceDetailsFromDB} from '../utils/queryUtils';
import {
  databaseDataSource,
  graphdbDataSource,
  httpDataSource,
  influxDataSource,
  mongoDbDataSource,
  neo4jDataSource,
} from './dataSourceService';
import {
  CredentialsSource,
  MessageCompletedTask,
  previewObject,
  UniqueKey,
} from '../types/types';

export async function setupSourceForExtraction(
  sourceId?: string,
  measure?: MeasureDto
): Promise<SourceDto[]> {
  const dataSources: SourceDto[] = [];
  if (sourceId) {
    const sourceIds: string[] = sourceId.split(',');
    for (const id of sourceIds) {
      dataSources.push(await retriveDataSourceDetailsFromDB(id));
    }
  } else if (measure) {
    dataSources.push(measure.source);
  }
  return dataSources;
}

export async function extractDataFromDataSource(
  dataSources: SourceDto[],
  credentialsSource: CredentialsSource
): Promise<ResponseDTO> {
  const message: previewObject[] & MessageCompletedTask[] = [];
  try {
    for (const dataSource of dataSources) {
      let result: UniqueKey | object | undefined;
      const measureTypeOfDataSource: MeasureType = dataSource.type;
      switch (measureTypeOfDataSource) {
        case MeasureType.rest:
          result = (await httpDataSource(dataSource)) as object;
          break;
        case MeasureType.neo4j:
          result = await neo4jDataSource(dataSource, credentialsSource);
          break;
        case MeasureType.influx:
          result = await influxDataSource(dataSource, credentialsSource);
          break;
        case MeasureType.mongodb:
          result = await mongoDbDataSource(dataSource, credentialsSource);
          break;
        case MeasureType.graphdb:
          result = await graphdbDataSource(dataSource);
          break;
        default:
          result = await databaseDataSource(
            dataSource,
            measureTypeOfDataSource,
            credentialsSource
          );
          break;
      }
      if (message) {
        message.push(
          createMessageCompletedTask(result, measureTypeOfDataSource)
        );
      }
    }
    return createResponseDto('Data extracted', 200, message);
  } catch (error) {
    return createResponseDto(error.message, 400, {});
  }
}
