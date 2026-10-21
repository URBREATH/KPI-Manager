import dotenv from "dotenv"

dotenv.config();

export const EXPRESS_PORT = process.env.EXPRESS_PORT || 3006;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS || "false";

export const ORION_URL = process.env.ORION_URL || "http://localhost:1026";
export const NGSI_BROKER_URL = process.env.NGSI_BROKER_URL || "http://localhost:8082";
export const KPIM_MEASURE_MANAGER_API_URL = process.env.KPIM_MEASURE_MANAGER_API_URL || 'http://localhost:3010';
export const FROST_SERVER_URL = process.env.FROST_SERVER_URL|| 'http://localhost:11010/FROST-Server/v1.1';

 
