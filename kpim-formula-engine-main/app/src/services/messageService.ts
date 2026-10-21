import {
    KPI_ID
} from "../utils/constants";
import {sendMessageToKafka} from "./kafkaClient";


export async function distributeTaskMessage(payload: number, kpiName?: string){
    const influxPayload: PayloadInflux = buildPayloadForInfluxDatabase(payload, kpiName);
    await sendMessageToKafka(JSON.stringify(influxPayload))

}

function buildPayloadForInfluxDatabase(expressioneResult: number, kpiName?: string): PayloadInflux {
    return {
        originatorId: KPI_ID!,
        measurement: kpiName!,
        ts: Date.now(),
        data:{
            result: parseFloat(String(expressioneResult))
        }
    }
}
