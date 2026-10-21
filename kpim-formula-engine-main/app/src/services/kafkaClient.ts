import { kafkaClient } from "../utils/kafkaConfig";
import { KAFKA_TOPIC_TASK_COMPLETED } from "../utils/constants";
import * as $log from '../modules/Logger';
import {Producer} from "kafkajs";

let kafkaProducer: Producer;

const retry = async (fn, retries = 50, delay = 2500) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt < retries - 1) {
                $log.warn(`Retry ${attempt + 1}/${retries} failed, retrying in ${delay}ms...`, error);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
};

export async function producerInit(): Promise<boolean> {
    if (!kafkaProducer) {
        kafkaProducer = kafkaClient.producer();
        $log.debug("kafkaClient", "Initializing Kafka producer");
        try {
            await retry(() => kafkaProducer.connect());
            $log.info("kafkaClient", "Producer connected");
            return true;
        } catch (error) {
            $log.error("kafkaClient", `Error connecting producer: ${error}`);
            return false;
        }
    }
    $log.debug("kafkaClient", "Kafka producer already initialized");
    return true;
}

export async function sendMessageToKafka(messageKafka: string) {
    try {
        $log.debug(`kafkaClient`, `Attempting to send message ${ messageKafka }`);
        const producerInitialized = await producerInit();
        if (!producerInitialized) {
            throw new Error("Failed to initialize Kafka producer");
        }

        $log.debug("kafkaClient", "Kafka producer initialized, sending message");
        await retry(() => kafkaProducer.send({
            topic: KAFKA_TOPIC_TASK_COMPLETED,
            messages: [{ value: messageKafka }],
        }));
        $log.info(`kafkaClient`, `Message sent to topic ${KAFKA_TOPIC_TASK_COMPLETED}`);
        await kafkaProducer.disconnect();
    } catch (error) {
        $log.error('Error sending message:', error);
    }
}
