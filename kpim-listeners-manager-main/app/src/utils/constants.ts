import dotenv from "dotenv"
dotenv.config();

//Express Server Port

export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3004;
//Cors Config
export const CORS_ORIGIN: string | undefined = process.env.CORS_ORIGIN;
export const CORS_CREDENTIALS: string = process.env.CORS_CREDENTIALS ?? "true";

export const TENANT_ID: string = process.env.TENANT_ID ?? 'dev';
//InfluxDB connection
export const INFLUXDB_URL: string = process.env.INFLUXDB_URL ?? 'http://localhost:8086';
export const INFLUXDB_TOKEN: string | undefined = process.env.INFLUXDB_TOKEN?? '3rAYTOJFEVEqrvMqJ49zPrDb4MSfvf-3X2Orhv-bwCWayffeuwObwGsjsmvAI6jhPcnx2UHrA_h7K1IUpiaAzg==';
export const INFLUXDB_ORG: string = process.env.INFLUXDB_ORG ?? 'my-org';
