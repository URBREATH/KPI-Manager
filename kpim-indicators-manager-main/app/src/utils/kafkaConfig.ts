import {Kafka, KafkaConfig} from "kafkajs";
import {
    KAFKA_AUTH_CA,
    KAFKA_AUTH_CERT,
    KAFKA_AUTH_ENABLED,
    KAFKA_AUTH_KEY,
    KAFKA_BROKERS,
    KAFKA_GROUP_ID
} from "./constants";
import {readFileSync} from "fs";


export interface KafkaMessageTaskCompleted {
    taskId: string;
    data: object;
}

let brokers: string[] = [];

if (KAFKA_BROKERS) {
    brokers = KAFKA_BROKERS.split(',').map(v => v.trim());
}

const kafkaConfig: KafkaConfig = { brokers: brokers, clientId: KAFKA_GROUP_ID };
if (KAFKA_AUTH_ENABLED) {
    kafkaConfig.ssl = {
        ca: readFileSync(KAFKA_AUTH_CA ?? 'ca.crt', 'utf-8'),
        key: readFileSync(KAFKA_AUTH_KEY ?? 'client-key.pem', 'utf-8'),
        cert: readFileSync(KAFKA_AUTH_CERT ?? 'client-cert.pem', 'utf-8')
    }
}


export const kafkaClient = new Kafka(kafkaConfig)
