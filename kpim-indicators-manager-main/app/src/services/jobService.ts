import {createResponseDto, FormulaDto, ResponseDTO} from '@he_hurbreath/kpi-models-support-main';
import * as $log from '../modules/Logger';
import {
    INFLUX_MAX_RETRY_ATTEMPTS,
    INFLUX_WATCHER_POLLING_SECONDS,
    KPIM_FORMULA_ENGINE_URL,
    KPIM_LISTENERS_MANAGER_API_URL,
    TENANT_ID
} from '../utils/constants';
import {sendMessageToKafka} from "./kafkaClient";
import {KpiError} from "../utils/enum";
import axios from "axios";
import {updateLastValueKpi} from "./kpiService";

async function invokeKpimListenersManager(kpiName: string): Promise<number[]> {
    const params = {
        bucket: TENANT_ID,
        measurement: kpiName,
        kpimEngineRequest: false
    }
    $log.info("listenersManager", "request params", { params });
$log.info("listenersManager", "calling URL", { url: KPIM_LISTENERS_MANAGER_API_URL });
    const listenersManagerResult = await axios.get(KPIM_LISTENERS_MANAGER_API_URL + `/api/v1/historical-data/query/all`, {params});
    $log.info("listenersManager", "raw response", {
    status: listenersManagerResult.status,
    data: listenersManagerResult.data
});
    return listenersManagerResult.data.data.value;
}

export async function checkIfInfluxReceivedTheData(kpiName: string): Promise<boolean>{
    $log.info("redisClient", `First execution, check influx on measure name: ${kpiName}`,{ durationMs:0});
    let retryAttempts: number = 0;

    $log.info("jobService", "before influx",{ durationMs:0});
    const influxData = async (): Promise<boolean> => {
        while (retryAttempts < INFLUX_MAX_RETRY_ATTEMPTS) {
            const value: number[] | null = (await invokeKpimListenersManager(kpiName));
            if (value && value.length > 0) {
                return true;
            }
            retryAttempts++;
            await new Promise(res => setTimeout(res, INFLUX_WATCHER_POLLING_SECONDS * 200));
        }
        return false;
    };
     $log.info("jobService", "post influx",{ durationMs:0});
    return influxData();
}

export async function formulaPreviewService(payload: FormulaDto, firstExecution?: boolean, kpiName?: string, kpiId?: string): Promise<ResponseDTO> {
    try {
        const resultKpiFormulaEngine: ResponseDTO = await requestFormulaPreviewFormulaEngine(payload);
        $log.info("FormulaPreviewService", `${JSON.stringify(resultKpiFormulaEngine.data)}`,{ durationMs:0})
        if (firstExecution) {
            const extractInfluxData: any = resultKpiFormulaEngine.data;
            const influxDbMessage: PayloadInflux = {
                originatorId: kpiId!,
                measurement: kpiName!,
                ts: Date.now(),
                data: {
                    result: parseInt(extractInfluxData.result)
                },
            };
            if (resultKpiFormulaEngine.status !== 200) throw new Error("Error evaluating formula");
            await sendMessageToKafka(JSON.stringify(influxDbMessage));
            $log.info("FormulaPreviewService", `Updating Last Value KPI: ${kpiId} with value: ${influxDbMessage.data.result}`,{ durationMs:0});
            await updateLastValueKpi(kpiId!, influxDbMessage.data.result);
            return createResponseDto("Formula preview", 200, resultKpiFormulaEngine.data);
        }
        return createResponseDto("Formula preview", 200, resultKpiFormulaEngine.data);
    } catch (error) {
        return createResponseDto("Error creating Job", 400, {"error": KpiError.RETREIVING_DATA_FROM_MEASURE_CONNECTORS})
    }
}

async function requestFormulaPreviewFormulaEngine(payload: FormulaDto): Promise<ResponseDTO> {
    try {
        $log.info("Trying to execute preview formula", `Payload: ${JSON.stringify(payload)}`,{ durationMs:0});
        return (await axios.post(KPIM_FORMULA_ENGINE_URL + `/api/v1/formula/preview`, payload)).data;
    }
    catch (error) {
        return createResponseDto("Error evaluating formula", 400, {"error": KpiError.RETREIVING_DATA_FROM_MEASURE_CONNECTORS})
    }
}





