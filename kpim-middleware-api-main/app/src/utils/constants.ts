require("dotenv").config();

export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3000;
export const TENANT_ID = process.env.TENANT_ID ?? "Dev";

//Apis URL

export const KPIM_MEASURE_MANAGER_API_URL = process.env.KPIM_MEASURE_MANAGER_API_URL ?? "http://localhost:3010"
export const KPIM_INDICATORS_MANAGER_API_URL = process.env.KPIM_INDICATORS_MANAGER_API_URL ?? "http://localhost:3009"
export const KPIM_LISTENERS_MANAGER_API_URL = process.env.KPIM_LISTENERS_MANAGER_API_URL ?? "http://localhost:3004"
export const KPIM_FORMULA_ENGINE_URL = process.env.KPIM_FORMULA_ENGINE_URL ?? "http://localhost:3005"
export const KPIM_CONNECTORS_MANAGER_URL = process.env.KPIM_CONNECTORS_MANAGER_URL ?? "http://localhost:3007"
export const  KPIM_PUBLISHER_MANAGER_URL= process.env.KPIM_PUBLISHER_MANAGER_URL ?? "http://localhost:3006"

//CORS Settings
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:9000"
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS ?? "true"

export const API_BASE_URL = (process.env.API_BASE_URL ?? `http://localhost:${EXPRESS_PORT}`).replace(/\/+$/, "");
export const GUI_BASE_URL = process.env.GUI_BASE_URL ?? "http://localhost:9000/";

export const SECRET_KEY_SESSION = process.env.SECRET_KEY_SESSION ?? "secret"

//ETCD connection
export const ETCD_ENABLED = process.env.ETCD_ENABLED == 'true';
export const ETCD_HOSTS = process.env.ETCD_HOSTS ?? "localhost:2379"

//Keycloak connection
export const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? 'kpi-manager-app';
export const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
export const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL ?? "http://localhost:8085/auth"
export const KEYCLOAK_ACCOUNT_USERNAME = process.env.KEYCLOAK_ACCOUNT_USERNAME ?? "admin-kpi"
export const KEYCLOAK_ACCOUNT_PASSWORD = process.env.KEYCLOAK_ACCOUNT_PASSWORD ?? "admin"
