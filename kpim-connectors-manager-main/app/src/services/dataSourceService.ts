import {
  createDataSourceConnection,
  createInfluxConnection,
  createMongoDBConnection,
  createNeo4jConnection,
} from '../config/dbConnectorsConfig';
import * as $log from '../modules/Logger';
import {SourceDto} from '@he_hurbreath/kpi-models-support-main';
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {interpretJsonPath} from '../utils/jsonUtils';
import {
  executeGraphdbQuery,
  executeNeo4jQuery,
  executeQueryInflux,
  groupByKey,
  parseQuery,
} from '../utils/queryUtils';
import {Session} from 'neo4j-driver';
import {Mongoose} from 'mongoose';
import {CredentialsSource, UniqueKey} from '../types/types';
import {
  parseHeaders,
  sanitizeAndValidateHeaders,
  sanitizeAndValidateQuery,
} from '../utils/santizeUtils';
import {DataSource} from 'typeorm';

export async function neo4jDataSource(
  DataSourceDetailsFromDB: SourceDto,
  credentialsSource: CredentialsSource
): Promise<UniqueKey> {
  const driver = await createNeo4jConnection(
    DataSourceDetailsFromDB,
    credentialsSource
  );
  const session: Session = driver.session();
  return groupByKey(await executeNeo4jQuery(session, DataSourceDetailsFromDB));
}

export async function influxDataSource(
  DataSourceDetailsFromDB: SourceDto,
  credentialsSource: CredentialsSource
): Promise<object> {
  let result: any;
  const organization: string =
    DataSourceDetailsFromDB.auth?.databaseName ?? 'default';
  const influx = await createInfluxConnection(
    DataSourceDetailsFromDB,
    credentialsSource
  );
  if (DataSourceDetailsFromDB.spec.query !== undefined) {
    result = await executeQueryInflux(
      organization,
      DataSourceDetailsFromDB.spec.query,
      influx
    );
  }
  return result;
}

export async function graphdbDataSource(
  DataSourceDetailsFromDB: SourceDto
): Promise<any> {
  return await executeGraphdbQuery(DataSourceDetailsFromDB);
}

export async function mongoDbDataSource(
  DataSourceDetailsFromDB: SourceDto,
  credentialsSource: CredentialsSource
): Promise<number[]> {
  const client: Mongoose = await createMongoDBConnection(
    DataSourceDetailsFromDB,
    credentialsSource
  );
  const collectionName: string =
    DataSourceDetailsFromDB.spec.collectionName ?? 'default';
  const jsonPath: string = DataSourceDetailsFromDB.spec.jsonPath ?? 'null';
  try {
    const db = client.connection;
    const collection = db.collection(collectionName);
    const resultQuery = await collection.find().toArray();
    const jsonPathQueryResult: number[] = interpretJsonPath(
      resultQuery,
      jsonPath
    ) as number[];
    if (jsonPathQueryResult !== undefined) {
      return jsonPathQueryResult;
    } else {
      return [];
    }
  } catch (error) {
    $log.error('Error executing the query in MongoDB:', error);
    throw error;
  } finally {
    await client.disconnect();
  }
}

export async function databaseDataSource(
  DataSourceDetailsFromDB: SourceDto,
  measureTypeDataSource: string,
  credentialsSource: CredentialsSource
): Promise<UniqueKey | undefined> {
  const query: string | undefined = DataSourceDetailsFromDB.spec?.query;
  const db: DataSource = await createDataSourceConnection(
    DataSourceDetailsFromDB,
    measureTypeDataSource,
    credentialsSource
  );
  return groupByKey(await db.query(query!));
}

export async function httpDataSource(
  connectionDetails: SourceDto
): Promise<number[]> {
  const {
    spec: {method, headers, query, jsonPath},
  } = connectionDetails;
  let parsedHeaders: Record<string, string> = {};
  let parsedQuery: Record<string, string | number | boolean> = {};
  const allowedMethods: string[] = ['GET', 'POST'];
  const methodHttp: string = method ? method.toUpperCase() : '';
  if (connectionDetails.spec.headers) {
    parsedHeaders = parseHeaders(connectionDetails.spec.headers);
  }
  if (!allowedMethods.includes(methodHttp)) {
    throw new Error(`Invalid HTTP method: ${method}`);
  }

  if (headers) {
    try {
      parsedHeaders = sanitizeAndValidateHeaders(parsedHeaders);
    } catch (error) {
      $log.error('SourceService', 'Error parsing headers: ' + error);
    }
  }
  parsedHeaders['Content-Type'] = 'application/json';

  if (query) {
    parsedQuery = typeof query === 'object' ? query : parseQuery(query);
    parsedQuery = sanitizeAndValidateQuery(parsedQuery);
  }

  const config: AxiosRequestConfig = {
    method: methodHttp as 'GET | POST',
    url: connectionDetails.uri,
    headers: parsedHeaders,
    params: parsedQuery,
    timeout: 0,
  };

  if (methodHttp === 'POST') {
    config['data'] = connectionDetails.spec.body;
  }
  
  try {
    console.log(
      'Starting request with the following configuration:',
      JSON.stringify(config, null, 2)
    );

    const response = await axios.request(config);

    const evaluateJsonPathObject: number[] = interpretJsonPath(
      response.data,
      jsonPath ?? 'null'
    );

    console.log('Result of interpretJsonPath:', evaluateJsonPathObject);

    return evaluateJsonPathObject;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('SourceService: Axios error during HTTP request:');
      console.error('- Message:', axiosError.message);
      console.error('- Code:', axiosError.code);
      console.error('- Config:', JSON.stringify(axiosError.config, null, 2));

      if (axiosError.response) {
        console.error('- Status:', axiosError.response.status);
        console.error(
          '- Data:',
          JSON.stringify(axiosError.response.data, null, 2)
        );
        console.error(
          '- Headers:',
          JSON.stringify(axiosError.response.headers, null, 2)
        );
      } else if (axiosError.request) {
        console.error(
          '- No response received. Request details:',
          axiosError.request
        );
      }
    } else {
      console.error(
        'SourceService: Non-Axios error during HTTP request:',
        error
      );
    }

    return [] as number[];
  }
}
