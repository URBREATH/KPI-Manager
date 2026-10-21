"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishSensor = publishSensor;
exports.publishThing = publishThing;
exports.publishObservedProperty = publishObservedProperty;
exports.publishLocation = publishLocation;
exports.publishDatastream = publishDatastream;
exports.publishObservation = publishObservation;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("../utils/constants");
function getCreatedEntityId(response, entity) {
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
function requireEntityId(id, relation) {
    if (id === undefined || id === null || String(id).trim() === "") {
        throw new Error(`Cannot publish FROST entity: missing ID for ${relation}`);
    }
    return String(id);
}
async function getOrCreate(entity, name, payload) {
    try {
        // Cerca l'entità esistente
        const response = await axios_1.default.get(`${constants_1.FROST_SERVER_URL}/${entity}`, {
            params: {
                $filter: `name eq '${name.replace(/'/g, "''")}'`
            }
        });
        const entities = response.data?.value || [];
        if (entities.length > 0) {
            const id = entities[0]["@iot.id"];
            if (id === undefined || id === null) {
                throw new Error(`FROST ${entity} lookup returned an entity without @iot.id`);
            }
            console.log(`${entity} already exists: ${id}`);
            return String(id);
        }
        console.log(`POST ${entity}:`, JSON.stringify(payload, null, 2));
        // Crea l'entità
        const createResponse = await axios_1.default.post(`${constants_1.FROST_SERVER_URL}/${entity}`, payload);
        console.log(`${entity} created`);
        console.log("Response status:", createResponse.status);
        console.log("Response data:", createResponse.data);
        console.log("Response headers:", createResponse.headers);
        const location = createResponse.headers.location || createResponse.headers.Location;
        if (location)
            console.log(`${entity} Location:`, location);
        const id = getCreatedEntityId(createResponse, entity);
        console.log(`${entity} ID:`, id);
        return id;
    }
    catch (error) {
        console.error(`Error creating/finding ${entity}:`, error.response?.data ||
            error.message);
        throw error;
    }
}
async function publishSensor(sensor) {
    return getOrCreate("Sensors", sensor.name, sensor);
}
async function publishThing(thing) {
    return getOrCreate("Things", thing.name, thing);
}
async function publishObservedProperty(observedProperty) {
    return getOrCreate("ObservedProperties", observedProperty.name, observedProperty);
}
async function publishLocation(location, thingId) {
    const payload = {
        ...location,
        Things: [
            {
                "@iot.id": requireEntityId(thingId, "Thing")
            }
        ]
    };
    const response = await axios_1.default.post(`${constants_1.FROST_SERVER_URL}/Locations`, payload);
    return getCreatedEntityId(response, "Location");
}
async function publishDatastream(datastream, sensorId, thingId, observedPropertyId) {
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
    const response = await axios_1.default.post(`${constants_1.FROST_SERVER_URL}/Datastreams`, payload);
    return getCreatedEntityId(response, "Datastream");
}
async function publishObservation(observation, datastreamId) {
    const payload = {
        ...observation,
        Datastream: {
            "@iot.id": requireEntityId(datastreamId, "Datastream")
        }
    };
    const response = await axios_1.default.post(`${constants_1.FROST_SERVER_URL}/Observations`, payload);
    return getCreatedEntityId(response, "Observation");
}
