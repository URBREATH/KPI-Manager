import { DataSource } from "typeorm";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, ENVIRONMENT } from "./constants";
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
    entities: [__dirname + '/../models/DAO/*.ts', __dirname + '/../models/DAO/*.js']
})

