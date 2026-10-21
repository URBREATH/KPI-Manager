import { kafkaClient } from "../utils/kafkaConfig";
import { KAFKA_GROUP_ID, KAFKA_TOPIC } from "../utils/constants";
import {Consumer, Producer} from "kafkajs";
import * as $log from '../modules/Logger';

let kafkaProducer: Producer;

export async function producerInit(): Promise<boolean> {
    kafkaProducer = kafkaClient.producer();
    try {
        await kafkaProducer.connect();
        $log.info("kafkaClient", "Producer connected");
        return true;
    } catch (error) {
        $log.error("kafkaClient", error);
        return false;
    }
}

export async function sendMessageToKafka(message: string) {
    try {
        await kafkaProducer.send({
            topic: KAFKA_TOPIC,
            messages: [{ value: message }],
        });
        $log.info(`kafkaClient`, `Message sent to topic ${KAFKA_TOPIC}`);
    } catch (error) {
        $log.error('Error sending message:', error);
    }
}

export async function consumerInit(): Promise<Consumer | undefined> {
    const kafkaConsumer: Consumer = kafkaClient.consumer({ groupId: KAFKA_GROUP_ID });
    let topics: string[] = KAFKA_TOPIC.split(",");
    $log.info("kafkaClient", `Subscribing to topics: ${topics}`);
    await kafkaConsumer.subscribe({ topics: topics });

    try {
        await kafkaConsumer.connect();
        $log.info("kafkaClient", "Consumer connected");
        return kafkaConsumer;
    } catch (error) {
        $log.error("kafkaClient", error);
    }
}

