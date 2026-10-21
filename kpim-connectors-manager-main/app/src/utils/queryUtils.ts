import {
  mapToClass,
  Source,
  SourceDto,
} from '@he_hurbreath/kpi-models-support-main';
import * as $log from '../modules/Logger';
import {AppDataSource} from '../config/dbConnectorsConfig';
import {Session} from 'neo4j-driver';
import {InfluxDB, QueryApi} from '@influxdata/influxdb-client';
import {credentials, UniqueKey} from '../types/types';
import {Repository} from 'typeorm';
import {retrieveCredentialsFromVault} from './vaultUtils';
import axios from 'axios';

const SourceRepository: Repository<Source> =
  AppDataSource.getRepository(Source);

export async function retriveDataSourceDetailsFromDB(
  sourceId: string
): Promise<SourceDto> {
  const retriveDataSourceDetailsFromDB: SourceDto[] =
    await getSourceById(sourceId);
  return retriveDataSourceDetailsFromDB[0];
}

export async function getSourceById(id: string): Promise<SourceDto[]> {
  const sourceFound: SourceDto[] = [];
  const fountSources: Source[] = await SourceRepository.find({
    where: {id_PK: id},
    relations: ['auth', 'spec_FK'],
  });
  for (const currentSource of fountSources) {
    sourceFound.push(mapToClass(currentSource, SourceDto));
  }
  return sourceFound;
}

export async function executeGraphdbQuery(DataSourceDetailsFromDB: SourceDto) {
  const url = `${DataSourceDetailsFromDB.uri}:${DataSourceDetailsFromDB.port}/repositories/${DataSourceDetailsFromDB.spec.collectionName}`;
  const query: string = DataSourceDetailsFromDB.spec.query!;
  const credentialsObject: credentials = await retrieveCredentialsFromVault(
    DataSourceDetailsFromDB
  );
  const axiosHeaders: Record<string, string> = {
    'Content-Type': 'application/sparql-query',
    Accept: 'application/sparql-results+json',
  };
  if (credentialsObject.username && credentialsObject.accessKey) {
    axiosHeaders['Authorization'] =
      `Basic ${btoa(`${credentialsObject.username}:${credentialsObject.accessKey}`)}`;
  }
  const queryResult = await axios.post(url, query, {headers: axiosHeaders});
  if (queryResult.data.results) {
    return queryResult.data.results.bindings;
  }
}

export async function executeNeo4jQuery(
  session: Session,
  DataSourceDetailsFromDB: SourceDto
) {
  if (DataSourceDetailsFromDB.spec.query !== undefined) {
    let result: any = await session.run(DataSourceDetailsFromDB.spec.query);
    result = result.records.map((record: any) => {
      const obj: any = {};
      record.forEach((value: any, key: string) => {
        if (value && value.constructor.name === 'Integer') {
          obj[key] = value.toNumber();
        } else {
          obj[key] = value;
        }
      });
      return obj;
    });
    return await result;
  }
  return {data: {}};
}

export async function executeQueryInflux(
  organization: string,
  query: string,
  influxDB: InfluxDB
): Promise<any[]> {
  const queryApi: QueryApi = influxDB.getQueryApi(organization);
  const results: any[] = [];

  return new Promise((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        console.log(o);
        results.push(o);
      },
      error(error) {
        $log.error('queryUtils', 'Error executing query' + error);
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
}

export function parseQuery(queryString: string): Record<string, any> {
  const parsedQuery: Record<string, any> = {};
  const queryArray: string[] = queryString.split('&');
  for (const query of queryArray) {
    const [key, value] = query.split('=');
    parsedQuery[key] = value;
  }
  return parsedQuery;
}

export function groupByKey(dataArray: UniqueKey[]): UniqueKey {
  const groupedData: UniqueKey = {};

  dataArray.forEach(item => {
    Object.keys(item).forEach(key => {
      if (groupedData[key] === undefined) {
        groupedData[key] = [];
      }
      groupedData[key].push(item[key]);
    });
  });
  return groupedData;
}
