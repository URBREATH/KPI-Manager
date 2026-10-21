import { Kafka, KafkaConfig } from "kafkajs";
import { KAFKA_BROKERS, KAFKA_AUTH_ENABLED, KAFKA_AUTH_CA, KAFKA_AUTH_CERT, KAFKA_AUTH_KEY, KAFKA_GROUP_ID } from "./constants";
import { readFileSync } from "fs";
import * as $log from '../modules/Logger';

let brokers: string[] = [];

if (KAFKA_BROKERS) {
    brokers = KAFKA_BROKERS.split(',').map(v => v.trim());
}

const kafkaConfig: KafkaConfig = { brokers: brokers, clientId: KAFKA_GROUP_ID };
if (KAFKA_AUTH_ENABLED) {
    kafkaConfig.ssl = {
        ca: readFileSync(KAFKA_AUTH_CA, 'utf-8'),
        key: readFileSync(KAFKA_AUTH_KEY, 'utf-8'),
        cert: readFileSync(KAFKA_AUTH_CERT, 'utf-8')
    }
    $log.info("kafkaClient", `Using SSL: CA: ${KAFKA_AUTH_CA}, Key: ${KAFKA_AUTH_KEY}, Cert: ${KAFKA_AUTH_CERT}`);
}



export const kafkaClient = new Kafka(kafkaConfig)
