import {MessageCompletedTask} from '../types/types';
import {MeasureType} from '@he_hurbreath/kpi-models-support-main';

export function createMessageCompletedTask(
  data: any,
  measureTypeOfDataSource: MeasureType
): any {
  switch (measureTypeOfDataSource) {
    case MeasureType.rest:
    case MeasureType.mongodb:
      return data;

    case MeasureType.postgres:
    case MeasureType.neo4j:
      return Object.values(data).find(value => Array.isArray(value));

    case MeasureType.influx:
      return data.map((element: any) => element._value);

    case MeasureType.graphdb:
      return data.map(item => {
        const firstKey = Object.keys(item)[0];
        return item[firstKey].value;
      });

    default:
      return {} as MessageCompletedTask;
  }
}
