import {DataSource, DataSourceOptions} from 'typeorm';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from '../utils/constants';
import {SourceDto} from '@he_hurbreath/kpi-models-support-main';
import * as $log from '../modules/Logger';
import neo4j, {Driver} from 'neo4j-driver';
import {InfluxDB} from '@influxdata/influxdb-client';
import path from 'path';
import mongoose from 'mongoose';
import {ConnectionInfo, credentials, CredentialsSource} from '../types/types';
import {retrieveCredentialsFromVault} from '../utils/vaultUtils';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [
    path.resolve(
      __dirname,
      '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.js'
    ),
    path.resolve(
      __dirname,
      '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.d.ts'
    ),
  ],
});

export async function createDataSourceConnection(
  connectionDetails: SourceDto,
  dataSourceType: string,
  credentialsSource: CredentialsSource
): Promise<DataSource> {
  const credentials = await getDataSourceCredentials(
    credentialsSource,
    connectionDetails
  );

  if (!credentials || !credentials.username) {
    throw new Error('Invalid credentials for data source');
  }
  const connectionInfo: ConnectionInfo = stripProtocol(connectionDetails.uri);

  const dataSourceConfig: DataSourceOptions = {
    type: dataSourceType as any,
    host: connectionInfo.uri,
    port: connectionDetails.port,
    username: credentials.username,
    password: credentials.accessKey,
    database: connectionDetails.auth?.databaseName || 'default',
    ...(connectionInfo.protocol === 'https' && {ssl: true}),
  };

  $log.info('dbConnectorsConfig', JSON.stringify(dataSourceConfig));
  const dataSource = new DataSource(dataSourceConfig);

  try {
    await dataSource.initialize();
    $log.info('dbConnectorsConfig', 'Data source initialized successfully');
    return dataSource;
  } catch (error) {
    $log.error('Failed to initialize data source:', error);
    throw error;
  }
}

function stripProtocol(uri: string): ConnectionInfo {
  const regexFindProtocol = /^(http|https|postgres):\/\//;
  const prefixFound: RegExpMatchArray | null = uri.match(regexFindProtocol);

  if (!prefixFound) return {uri, protocol: 'http'};

  const cleanedUri: string = uri.replace(regexFindProtocol, '');

  return {
    uri: cleanedUri,
    protocol: prefixFound[1] as ConnectionInfo['protocol'],
  };
}

export async function createNeo4jConnection(
  connectionDetails: SourceDto,
  credentialsSource: CredentialsSource
): Promise<Driver> {
  const credentials = await getDataSourceCredentials(
    credentialsSource,
    connectionDetails
  );

  if (!credentials || !credentials.username) {
    throw new Error('Invalid credentials for Neo4j');
  }

  let connectionUri: string = connectionDetails.uri;
  let driverConfig: any = {};

  if (
    !connectionUri.startsWith('neo4j://') &&
    !connectionUri.startsWith('neo4j+s://') &&
    !connectionUri.startsWith('bolt://')
  ) {
    connectionUri = `neo4j://${connectionUri}`;
  }

  if (connectionUri.startsWith('bolt://')) {
    driverConfig = {
      encrypted: 'ENCRYPTION_ON',
      trust: 'TRUST_ALL_CERTIFICATES',
    };
  }

  if (connectionDetails.port) {
    connectionUri = `${connectionUri}:${connectionDetails.port}`;
  }

  const driver = neo4j.driver(
    connectionUri,
    neo4j.auth.basic(credentials.username, credentials.accessKey ?? ''),
    driverConfig
  );

  try {
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j successfully');
    return driver;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    throw error;
  }
}

export async function createInfluxConnection(
  connectionDetails: SourceDto,
  credentialsSource: CredentialsSource
): Promise<InfluxDB> {
  const credentials = await getDataSourceCredentials(
    credentialsSource,
    connectionDetails
  );

  let connectionUri: string;
  if (connectionDetails.port) {
    connectionUri = `${connectionDetails.uri}:${connectionDetails.port}`;
  } else {
    connectionUri = connectionDetails.uri;
  }
  return new InfluxDB({
    url: connectionUri,
    token: credentials.accessKey,
  });
}

export async function createMongoDBConnection(
  connectionDetails: SourceDto,
  credentialsSource: CredentialsSource
): Promise<mongoose.Mongoose> {
  const credentials = await getDataSourceCredentials(
    credentialsSource,
    connectionDetails
  );

  const connectionUri = buildMongoUri(credentials, connectionDetails);

  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: connectionDetails.auth?.databaseName || 'default',
  };

  try {
    await mongoose.connect(connectionUri, mongoOptions);
    console.log('Connected to MongoDB successfully');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

async function getDataSourceCredentials(
  credentialsSource: CredentialsSource,
  connectionDetails: SourceDto
): Promise<credentials> {
  if (credentialsSource === 'body') {
    return {
      username: connectionDetails.auth?.username || '',
      accessKey: connectionDetails.auth?.accessKey || '',
    };
  }
  return await retrieveCredentialsFromVault(connectionDetails);
}

function buildMongoUri(
  credentials: credentials,
  connectionDetails: SourceDto
): string {
  let uri = connectionDetails.uri;

  const hasProtocol = /^mongodb(\+srv)?:\/\//.test(uri);
  if (!hasProtocol) {
    uri = `mongodb://${uri}`;
  }

  if (credentials.username) {
    const authPart = credentials.accessKey
      ? `${encodeURIComponent(credentials.username)}:${encodeURIComponent(credentials.accessKey)}@`
      : `${encodeURIComponent(credentials.username)}@`;

    const prefixEnd = uri.indexOf('://') + 3;
    uri = uri.slice(0, prefixEnd) + authPart + uri.slice(prefixEnd);
  }

  return uri;
}
