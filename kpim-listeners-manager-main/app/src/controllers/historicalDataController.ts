import { Request, Response, NextFunction } from "express";
import {
    queryHistoricalDataByDateRangeService,
    queryInfluxBucketService,
    retrieveAllHistoricalDataService
} from "../services/HistoricalDataService";
import {ResponseDTO} from "../utils/mapper";
import * as $log from '../modules/Logger';
import {TENANT_ID} from "../utils/constants";

export async function queryInfluxBucket(req: Request, res: Response, next: NextFunction) {
    const { fluxQuery } = req.body;
    if (!fluxQuery) {
        return res.status(400).send('fluxQuery is required');
    }
    try {
        let result:ResponseDTO = await queryInfluxBucketService(fluxQuery);
        return res.status(result.status).json(result);
    } catch (error) {
        next(error);
    }
}

export async function queryHistoricalDataByDateRange(req: Request, res: Response, next: NextFunction){
    const { start, stop, lastValue } = req.query;
    if (!start || !stop) {
        return res.status(400).send('start and stop query parameters are required');
    }
    const queryResult: ResponseDTO = await queryHistoricalDataByDateRangeService(start as string, stop as string, lastValue as string);
    return res.status(queryResult.status).json(queryResult);
}

export async function retrieveAllHistoricalData(req: Request, res: Response, next: NextFunction) {
    const bucket: string = req.query.bucket as string ?? TENANT_ID;
    const measurement: string = req.query.measurement as string;
    const kpimEngineRequest: string = req.query.kpimEngineRequest as string;
    $log.info(`retrieveAllHistoricalData`,`Retrieving all historical data from bucket: ${bucket} and measurement: ${measurement}, kpimEngineRequest: ${kpimEngineRequest}`)
    try {
        const queryResult: ResponseDTO = await retrieveAllHistoricalDataService(bucket, measurement, kpimEngineRequest);
        return res.status(queryResult.status).json(queryResult);
    }catch(error)
    {
        $log.error(`retrieveAllHistoricalData`, `Error retrieving all historical data: ${error}`);
    }

}
