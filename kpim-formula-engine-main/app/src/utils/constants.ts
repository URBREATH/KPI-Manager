import dotenv from "dotenv"

dotenv.config();

//Postgres DB connection
export const DB_USER = process.env.DB_USER ?? 'postgres';
export const DB_HOST = process.env.DB_HOST ?? 'localhost';
export const DB_DATABASE = process.env.DB_DATABASE ?? 'indicators-manager';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'postgres';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;

//Express
export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3005;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS ?? "true";
export const SERVER_MODE = process.env.SERVER_MODE ?? "true";
//ENV Settings
export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'LOCAL';
export const TENANT_ID = process.env.TENANT_ID ?? 'dev';

//Kafka connection
export const KAFKA_BROKERS: string = process.env.KAFKA_BROKERS ?? 'localhost:19092';
export const KAFKA_GROUP_ID: string = process.env.KAFKA_GROUP_ID ?? 'indicators-manager-api';
export const KAFKA_AUTH_ENABLED: boolean = process.env.KAFKA_AUTH_ENABLED === "true";
export const KAFKA_AUTH_CA: string = process.env.KAFKA_AUTH_CA ?? '/etc/kafka/secret-volume/ca.crt';
export const KAFKA_AUTH_KEY: string = process.env.KAFKA_AUTH_KEY ?? '/etc/kafka/secret-volume/user.key';
export const KAFKA_AUTH_CERT: string = process.env.KAFKA_AUTH_CERT ?? '/etc/kafka/secret-volume/user.crt';
export const KAFKA_TOPIC_TASK_COMPLETED: string = process.env.KAFKA_TOPIC_TASK_COMPLETED ?? `indicators-task-completed`;

//Config comunication
export const KPIM_INDICATORS_MANAGER_API_URL: string = process.env.KPIM_INDICATORS_MANAGER_API_URL ?? 'http://localhost:3009';
export const KPIM_MEASURE_MANAGER_API_URL: string = process.env.KPIM_MEASURE_MANAGER_API_URL ??  'http://localhost:3010';
export const KPIM_LISTENERS_MANAGER_API_URL: string = process.env.KPIM_LISTENERS_MANAGER_API_URL ?? 'http://localhost:3004';
export const KPIM_CONNECTORS_MANAGER_URL: string = process.env.KPIM_CONNECTORS_MANAGER_URL ?? 'http://localhost:3007'

//Job Scheduler
export const KPI_ID: string | undefined = process.env.KPI_ID;
