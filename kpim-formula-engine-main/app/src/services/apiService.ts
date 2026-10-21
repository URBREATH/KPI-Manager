import axios, {AxiosResponse} from "axios";
import * as $log from '../modules/Logger';
import {
    DetailsDto,
    Measure, ResponseDTO
} from "@he_hurbreath/kpi-models-support-main";
import {
    KPIM_INDICATORS_MANAGER_API_URL,
    KPI_ID, KPIM_CONNECTORS_MANAGER_URL,
    KPIM_LISTENERS_MANAGER_API_URL,
    KPIM_MEASURE_MANAGER_API_URL,
    TENANT_ID
} from "../utils/constants";
import {mapMeasureDetailsResponses} from "../utils/mappingUtils";


export async function invokeGetMeasureDetails(measureId: string): Promise<AxiosResponse> {
    $log.info("invokeGetMeasureDetails", `Invoking measure details for measureId: ${measureId}`);
    return await axios.get(KPIM_MEASURE_MANAGER_API_URL + `/api/v1/measures/${measureId}`);
}

export async function invokeMeasureConnectorsService(sourceId: string): Promise<any> {
    $log.info("invokeMeasureConnectorsService", `Invoking measure connectors service for sourceId: ${sourceId}`);
     return await axios.get(KPIM_CONNECTORS_MANAGER_URL + `/api/v1/measures/fetch/${sourceId}`);
}

export async function invokeListenersManager(kpiName: string){
    $log.info("invokeListenersManager", `Invoking listeners manager`);
    const params = {
        bucket: TENANT_ID,
        measurement: kpiName,
        kpimEngineRequest: "true"
    }
    return await axios.get(KPIM_LISTENERS_MANAGER_API_URL + "/api/v1/historical-data/query/all", {params});

}

function createMeasureDetailsPromises(measureIds: string[]): Promise<AxiosResponse>[] {
    return measureIds.map(id => invokeGetMeasureDetails(id));
}

function extractMeasureIds(details: DetailsDto[]): string[] {
    return details
            .filter((detail) => detail?.type === "measure")
            .map((detail) => detail?.id)
            .filter((id): id is string => id !== undefined);
}

export async function invokeMeasureManagerService(details: DetailsDto[]): Promise<Measure[]> {
    try {
        const measureIds = extractMeasureIds(details);
        const measureDetailsPromises = createMeasureDetailsPromises(measureIds);
        const measureDetailsResponses = await Promise.all(measureDetailsPromises);
        return mapMeasureDetailsResponses(measureDetailsResponses);
    } catch (error) {
        throw new Error(`Error fetching measure details: ${error.message}`);
    }
}


export async function invokeListenersManagerService(kpiNames: string[]): Promise<TaskData[]>{
    let result: TaskData[] = []
    for (let kpiName of kpiNames) {
        let resultListenersManager = await invokeListenersManager(kpiName)
        let taskData: TaskData = {
            data: resultListenersManager.data.data.value
        }
        result.push(taskData)
    }
    return result;
}

export async function updateLastValueIndicatorsManager(lastValue: number): Promise<ResponseDTO>
{
    return await axios.put(KPIM_INDICATORS_MANAGER_API_URL + `/api/v1/kpi/last-value/${KPI_ID}`, {"value": lastValue});
}
