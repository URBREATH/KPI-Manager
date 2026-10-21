import dotenv from "dotenv"

dotenv.config();

//Postgres DB connection
export const DB_USER = process.env.DB_USER ?? 'postgres';
export const DB_HOST = process.env.DB_HOST ?? 'localhost';
export const DB_DATABASE = process.env.DB_DATABASE ?? 'indicators-manager';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'ADMIN';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const SYNCRONIZE_STATUS = process.env.SYNCRONIZE_STATUS ?? process.env.DB_SYNCHRONIZE ?? 'true';
export const CREATE_ORION_PUBLICATION_TABLE = process.env.CREATE_ORION_PUBLICATION_TABLE === 'true';
export const LOGGING = process.env.LOGGING ?? 'true';

//Express Server Port
export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3009;
export const TENANT_ID = process.env.TENANT_ID ?? 'dev';
export const K8S_NAMESPACE = process.env.K8S_NAMESPACE ?? TENANT_ID;
export const KPIM_ENGINE_IMAGE = process.env.KPIM_ENGINE_IMAGE ?? 'registry.urbreath.tech/formula-engine--api:v0.1';
export const SERVICE_ACCOUNT_NAME: string = process.env.SERVICE_ACCOUNT_NAME ?? 'kpi-sa';
//Cors Config
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS ?? "true";
//Kafka connection
export const KAFKA_BROKERS = process.env.KAFKA_BROKERS ?? 'localhost:19092';
export const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID ?? 'indicators-api-group';
export const KAFKA_AUTH_ENABLED = (process.env.KAFKA_AUTH_ENABLED == 'true')
export const KAFKA_AUTH_CA = process.env.KAFKA_AUTH_CA ?? 'src/utils/config/ca.crt';
export const KAFKA_AUTH_KEY = process.env.KAFKA_AUTH_KEY ?? 'src/utils/config/user.key';
export const KAFKA_AUTH_CERT = process.env.KAFKA_AUTH_CERT ?? 'src/utils/config/user.crt';
export const KAFKA_TOPIC = process.env.KAFKA_TOPIC ?? 'indicators-api-task-completed';

//Config comunication
export const KPIM_MEASURE_MANAGER_API_URL = process.env.KPIM_MEASURE_MANAGER_API_URL ?? 'http://localhost:3010';
export const KPIM_LISTENERS_MANAGER_API_URL = process.env.KPIM_LISTENERS_MANAGER_API_URL ?? 'http://localhost:3004';
export const KPIM_FORMULA_ENGINE_URL = process.env.KPIM_FORMULA_ENGINE_URL ?? 'http://localhost:3005';
export const KPIM_INDICATORS_MANAGER_API_URL = process.env.KPIM_INDICATORS_MANAGER_API_URL ?? 'http://localhost:3009';
export const KPIM_CONNECTORS_MANAGER_URL = process.env.KPIM_CONNECTORS_MANAGER_URL ?? 'http://kpi-connectors-manager.dev.svc.cluster.local:3000';
export const GUI_BASE_URL = process.env.GUI_BASE_URL ?? 'http://localhost:9000/';
//Redis connection
export const INFLUX_WATCHER_POLLING_SECONDS: number = 10;
export const INFLUX_MAX_RETRY_ATTEMPTS: number = 150;
//Kubernetes config
export const KUBE_CONFIG_PATH = process.env.KUBE_CONFIG_PATH ?? "C:\Users\rigaetaw\.kube\config";
export const KPIM_ADMIN_ROLE_KEYCLOAK = process.env.KPIM_ADMIN_ROLE_KEYCLOAK ?? "kpim-admin"
