import axios from "axios";
import {FROST_SERVER_URL} from '../utils/constants';

function getCreatedEntityId(response: any, entity: string): string {
    const bodyId = response.data?.["@iot.id"];
    if (bodyId !== undefined && bodyId !== null && String(bodyId).length > 0) {
        return String(bodyId);
    }

    const location = response.headers?.location || response.headers?.Location;
    const match = typeof location === "string" ? location.match(/\(([^)]+)\)/) : null;
    if (match?.[1]) {
        return match[1];
    }

    throw new Error(`FROST did not return an @iot.id or a valid Location header for ${entity}`);
}

function requireEntityId(id: string, relation: string): string {
    if (id === undefined || id === null || String(id).trim() === "") {
        throw new Error(`Cannot publish FROST entity: missing ID for ${relation}`);
    }
    return String(id);
}


async function getOrCreate(
    entity: string,
    name: string,
    payload: any
): Promise<string> {

    try {

        // Cerca l'entità esistente
        const response = await axios.get(
            `${FROST_SERVER_URL}/${entity}`,
            {
                params: {
                    $filter: `name eq '${name.replace(/'/g, "''")}'`
                }
            }
        );

        const entities = response.data?.value || [];

        if (entities.length > 0) {

            const id = entities[0]["@iot.id"];
            if (id === undefined || id === null) {
                throw new Error(`FROST ${entity} lookup returned an entity without @iot.id`);
            }

            console.log(
                `${entity} already exists: ${id}`
            );

            return String(id);
        }

        console.log(
    `POST ${entity}:`,
    JSON.stringify(payload, null, 2)
);

        // Crea l'entità
        const createResponse = await axios.post(
            `${FROST_SERVER_URL}/${entity}`,
            payload
        );

        console.log(
            `${entity} created`
        );

        console.log(
            "Response status:",
            createResponse.status
        );

        console.log(
            "Response data:",
            createResponse.data
        );

        console.log(
            "Response headers:",
            createResponse.headers
        );


        const location = createResponse.headers.location || createResponse.headers.Location;
        if (location) console.log(`${entity} Location:`, location);
        const id = getCreatedEntityId(createResponse, entity);

        console.log(
            `${entity} ID:`,
            id
        );


        return id;

    } catch (error: any) {

        console.error(
            `Error creating/finding ${entity}:`,
            error.response?.data ||
            error.message
        );

        throw error;
    }
}


export async function publishSensor(sensor: any): Promise<string> {

    return getOrCreate(
        "Sensors",
        sensor.name,
        sensor
    );
}


export async function publishThing(thing: any): Promise<string> {

    return getOrCreate(
        "Things",
        thing.name,
        thing
    );
}


export async function publishObservedProperty(
    observedProperty: any
): Promise<string> {

    return getOrCreate(
        "ObservedProperties",
        observedProperty.name,
        observedProperty
    );
}


export async function publishLocation(
    location: any,
    thingId: string
): Promise<string> {

    const payload = {
        ...location,

        Things: [
            {
                "@iot.id": requireEntityId(thingId, "Thing")
            }
        ]
    };

    const response = await axios.post(
        `${FROST_SERVER_URL}/Locations`,
        payload
    );

    return getCreatedEntityId(response, "Location");
}


export async function publishDatastream(
    datastream: any,
    sensorId: string,
    thingId: string,
    observedPropertyId: string
): Promise<string> {

    const payload = {

        ...datastream,

        Sensor: {
            "@iot.id": requireEntityId(sensorId, "Sensor")
        },

        Thing: {
            "@iot.id": requireEntityId(thingId, "Thing")
        },

        ObservedProperty: {
            "@iot.id": requireEntityId(observedPropertyId, "ObservedProperty")
        }
    };

    const response = await axios.post(
        `${FROST_SERVER_URL}/Datastreams`,
        payload
    );

    return getCreatedEntityId(response, "Datastream");
}


export async function publishObservation(
    observation: any,
    datastreamId: string
): Promise<string> {

    const payload = {

        ...observation,

        Datastream: {
            "@iot.id": requireEntityId(datastreamId, "Datastream")
        }
    };

    const response = await axios.post(
        `${FROST_SERVER_URL}/Observations`,
        payload
    );

    return getCreatedEntityId(response, "Observation");
}