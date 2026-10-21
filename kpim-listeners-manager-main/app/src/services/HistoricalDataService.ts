import {queryApi} from "./influxDbClient";
import {createResponseDto, ResponseDTO} from "../utils/mapper";
import {DateTime} from 'luxon'
import {TENANT_ID} from "../utils/constants";
import * as $log from '../modules/Logger';
export async function queryInfluxBucketService(fluxQuery: string): Promise<ResponseDTO> {
    try {
        const historicalDataResult = await queryApi.collectRows(fluxQuery);
        const historicalData = buildSummaryHistoricalData(historicalDataResult as object[]);
        return createResponseDto("HistoricalData", 200, historicalData)
    }catch(error){
        console.log(error)
        return createResponseDto("HistoricalData", 400, {})
    }
}

export async function queryHistoricalDataByDateRangeService(start: string, stop: string, lastValue: string): Promise<ResponseDTO> {
    const query = `
    from(bucket: "${TENANT_ID}")
      |> range(start: ${start}, stop: ${stop})
  `;
    try {
        const data = await queryApi.collectRows(query);
        if (lastValue === "true") return createResponseDto("HistoricalData", 200, data[0] as object)

        return createResponseDto("HistoricalData", 200, data)
    } catch (error) {
        return createResponseDto("HistoricalData", error.status, {})
    }
}

export async function retrieveAllHistoricalDataService(bucket: string, measurement: string, kpimEngineRequest: string) {
    let fluxQuery = `from (bucket: "${bucket}")|> range(start: 0)`;
    if (measurement) {
        fluxQuery = `from(bucket: "${bucket}") |> range(start: 0)|> filter(fn: (r) => r._measurement == "${measurement}")`;
    }

    $log.info(`retrieveAllHistoricalData`, `executing query: ${fluxQuery}`);

    try {
        const historicalDataResult: unknown[] | undefined = await queryApi.collectRows(fluxQuery);
        const historicalData: HistoricalDataDto = buildSummaryHistoricalData(historicalDataResult as object[]);
        if (kpimEngineRequest === "true") {
            const historicalDataKpimEngine: HistoricalDataKpimEngineDto = buildObjectHistoricalDataKpimEngine(historicalData, measurement);
            return createResponseDto("historicalData KpimEngine", 200, historicalDataKpimEngine)
        }
        return createResponseDto("HistoricalData", 200, historicalData)
    } catch (error) {
        const influxError = error as { message?: string; status?: number; code?: string };
        $log.error(
            'retrieveAllHistoricalData',
            `Influx query failed for bucket "${bucket}" and measurement "${measurement || '*'}"` +
            ` (status: ${influxError?.status ?? 'unknown'}, code: ${influxError?.code ?? 'unknown'}):` +
            ` ${influxError?.message ?? String(error)}`
        );
        return createResponseDto("HistoricalData", 400, {})
    }

}
export function calculateStatisticsValue(historicalDataResult: object[]) {
    const historicalValues: number[] = []
    for (let x of historicalDataResult){
        historicalValues.push(x['_value'])
    }
    const min: number = Math.min(...historicalValues)
    const max: number = Math.max(...historicalValues)
    const avg: number = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length
    return {
        min: min,
        max: max,
        avg: avg
    }
}

export function convertTimestampsToEuropeRome(timestamps: string[]): (string | null)[] {
    return timestamps.map(timestamp => {
        return DateTime.fromISO(timestamp, { zone: 'utc' }).setZone('Europe/Rome').toISO();
    });
}

export function buildSummaryHistoricalData(historicalDataResult: object[]){
    const statisticValues = calculateStatisticsValue(historicalDataResult);
    const convertedTimestamps = convertTimestampsToEuropeRome(historicalDataResult.map(x => x['_time']));
    const historicalData: HistoricalDataDto = {
        value: historicalDataResult.map(x => x['_value']),
        timestamp: convertedTimestamps as string[],
        statistics: statisticValues
    }
    return historicalData
}

function buildObjectHistoricalDataKpimEngine(historicalDataResult: HistoricalDataDto, measurement: string): HistoricalDataKpimEngineDto {
    let historicalDataKpimEngineDto: HistoricalDataKpimEngineDto;
    historicalDataKpimEngineDto = {
        measurementId: measurement,
        value: historicalDataResult.value
    }
    return historicalDataKpimEngineDto;
}



