import { DataSource } from "typeorm";
import {
    DB_DATABASE,
    DB_HOST,
    DB_PASSWORD,
    DB_PORT,
    DB_USER,
    LOGGING,
    SYNCRONIZE_STATUS
} from "./constants";
import * as $log from '../modules/Logger'
import path from "path";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: SYNCRONIZE_STATUS === 'true',
    logging: LOGGING === 'true',
    entities: [
        path.resolve(__dirname, '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.js'),
        path.resolve(__dirname, '../../node_modules/@he_hurbreath/kpi-models-support-main/dist/models/DAO/*.d.ts'),
        path.resolve(__dirname, '../models/*.{js,ts}')
    ]
})

$log.info('dbUtils', `${AppDataSource.options.entities}`);

export async function createOrionPublicationTable(): Promise<void> {
    await AppDataSource.query(`
        CREATE TABLE IF NOT EXISTS public.kpi_orion_publications (
            "kpiId" TEXT PRIMARY KEY,
            "tenantId" TEXT NOT NULL,
            "entityId" TEXT NOT NULL,
            "entityUrl" TEXT NOT NULL,
            "publishedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await AppDataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_kpi_orion_publications_tenant
        ON public.kpi_orion_publications ("tenantId")
    `);
}
