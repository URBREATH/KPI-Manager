import { DataSource } from "typeorm";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, ENVIRONMENT } from "./constants";
import path from "path";
let synchronizeStatus = (ENVIRONMENT === 'DEV' || ENVIRONMENT === 'LOCAL')
let logging = (ENVIRONMENT === 'DEV' || ENVIRONMENT === 'LOCAL')

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: synchronizeStatus,
    logging: logging,
    entities: [
        path.resolve(__dirname, '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.js'),
        path.resolve(__dirname, '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.d.ts')
    ]
})

