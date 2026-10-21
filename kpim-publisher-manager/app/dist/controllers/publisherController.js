"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishKpi = publishKpi;
exports.publishDataset = publishDataset;
exports.publishFrostServer = publishFrostServer;
exports.getOrionKpiStatusController = getOrionKpiStatusController;
exports.deleteKpiFromOrionController = deleteKpiFromOrionController;
const tslib_1 = require("tslib");
const kpiMapper_1 = require("../services/kpiMapper");
const orionPublisher_1 = require("../services/orionPublisher");
const ngsiBrokerPublisher_1 = require("../services/ngsiBrokerPublisher");
const constants_1 = require("../utils/constants");
const axios_1 = tslib_1.__importDefault(require("axios"));
const mapKpiToFrostServer_1 = require("../services/mapKpiToFrostServer");
const frostServerPublisher_1 = require("../services/frostServerPublisher");
async function publishKpi(req, res) {
    try {
        console.log('sono qui');
        console.log(req.body);
        const kpi = req.body;
        const entity = (0, kpiMapper_1.toNgsiLd)(kpi.item);
        console.log(entity);
        const result = await (0, orionPublisher_1.publishToOrion)(entity);
        const entityUrl = result.location || (0, orionPublisher_1.getOrionKpiEntityUrl)(kpi.item.id);
        return res.status(201).json({
            success: true,
            messageKey: "strings.orionPublishSuccess",
            entityUrl,
            entityId: entity.id
        });
    }
    catch (error) {
        console.error(error);
        const status = error?.response?.status || 500;
        const entity = req.body?.item ? (0, kpiMapper_1.toNgsiLd)(req.body.item) : null;
        const entityUrl = req.body?.item?.id
            ? (0, orionPublisher_1.getOrionKpiEntityUrl)(req.body.item.id)
            : entity?.id
                ? `${constants_1.ORION_URL.replace(/\/+$/, '')}/ngsi-ld/v1/entities/${encodeURIComponent(entity.id)}`
                : undefined;
        if (status === 409) {
            return res.status(409).json({
                success: false,
                messageKey: "strings.orionPublishAlreadyExists",
                entityUrl,
                entityId: entity?.id,
                details: error?.response?.data
            });
        }
        return res.status(status >= 400 && status < 600 ? status : 500).json({
            success: false,
            messageKey: "strings.orionPublishFailed",
            details: error?.response?.data || error?.message || "Unknown publication error."
        });
    }
}
async function publishDataset(req, res) {
    try {
        console.log('publishDataset');
        console.log(req.body);
        const result = await (0, ngsiBrokerPublisher_1.publishNgsiBroker)(req.body.distribution, req.body.dataset);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Publish dataset error:", error);
        const status = error?.response?.status || 500;
        const message = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Publish failed";
        return res.status(status).json({
            error: message
        });
    }
}
async function publishFrostServer(req, res) {
    try {
        const kpi = req.body.item;
        if (!kpi) {
            return res.status(400).json({
                success: false,
                messageKey: "strings.frostPublishInvalidKpi",
                message: "No KPI was provided for publication to the FROST Server."
            });
        }
        console.log("KPI received:");
        console.log(kpi);
        // --------------------------------------------------
        // 1. Retrieve selected measures
        // --------------------------------------------------
        const selectedMeasures = kpi.definition.selected
            .filter((item) => item.type === "measure");
        const measures = await Promise.all(selectedMeasures.map(async (item) => {
            const { data } = await axios_1.default.get(`${constants_1.KPIM_MEASURE_MANAGER_API_URL}` +
                `/api/v1/measures/${item.id}`);
            return data;
        }));
        console.log("Measures:");
        console.log(measures);
        // --------------------------------------------------
        // 2. Mapping KPI Manager -> FROST
        // --------------------------------------------------
        const sensor = (0, mapKpiToFrostServer_1.mapKpiToSensor)();
        const thing = (0, mapKpiToFrostServer_1.mapKpiToThing)(kpi);
        const location = (0, mapKpiToFrostServer_1.mapKpiToLocation)(kpi);
        const observedProperty = (0, mapKpiToFrostServer_1.mapKpiToObservedProperty)(kpi);
        const datastream = (0, mapKpiToFrostServer_1.mapKpiToDatastream)(kpi, measures);
        const observation = (0, mapKpiToFrostServer_1.mapKpiToObservation)(kpi);
        console.log("Mapped entities:");
        console.log("Sensor:", sensor);
        console.log("Thing:", thing);
        console.log("Location:", location);
        console.log("ObservedProperty:", observedProperty);
        console.log("Datastream:", datastream);
        console.log("Observation:", observation);
        // --------------------------------------------------
        // 3. Publish Sensor
        // --------------------------------------------------
        const sensorId = await (0, frostServerPublisher_1.publishSensor)(sensor);
        console.log("Sensor ID:", sensorId);
        // --------------------------------------------------
        // 4. Publish Thing
        // --------------------------------------------------
        const thingId = await (0, frostServerPublisher_1.publishThing)(thing);
        console.log("Thing ID:", thingId);
        // --------------------------------------------------
        // 5. Publish Location
        // --------------------------------------------------
        let locationId = null;
        if (location) {
            locationId =
                await (0, frostServerPublisher_1.publishLocation)(location, thingId);
            console.log("Location ID:", locationId);
        }
        // --------------------------------------------------
        // 6. Publish ObservedProperty
        // --------------------------------------------------
        const observedPropertyId = await (0, frostServerPublisher_1.publishObservedProperty)(observedProperty);
        console.log("ObservedProperty ID:", observedPropertyId);
        // --------------------------------------------------
        // 7. Publish Datastream
        // --------------------------------------------------
        const datastreamId = await (0, frostServerPublisher_1.publishDatastream)(datastream, sensorId, thingId, observedPropertyId);
        console.log("Datastream ID:", datastreamId);
        // --------------------------------------------------
        // 8. Publish Observation
        // --------------------------------------------------
        const observationId = await (0, frostServerPublisher_1.publishObservation)(observation, datastreamId);
        console.log("Observation ID:", observationId);
        // --------------------------------------------------
        // 9. Response
        // --------------------------------------------------
        const frostBaseUrl = constants_1.FROST_SERVER_URL.replace(/\/+$/, "");
        const reference = (collection, id) => id === null ? null : `${frostBaseUrl}/${collection}(${encodeURIComponent(id)})`;
        return res.status(201).json({
            success: true,
            messageKey: "strings.frostPublishSuccess",
            message: `KPI "${kpi.name}" was successfully published to the FROST Server.`,
            messageParams: { name: kpi.name },
            details: "Use the references below to inspect the published resources.",
            frost: {
                sensorId,
                thingId,
                locationId,
                observedPropertyId,
                datastreamId,
                observationId,
                references: {
                    sensor: reference("Sensors", sensorId),
                    thing: reference("Things", thingId),
                    location: reference("Locations", locationId),
                    observedProperty: reference("ObservedProperties", observedPropertyId),
                    datastream: reference("Datastreams", datastreamId),
                    observation: reference("Observations", observationId)
                }
            }
        });
    }
    catch (error) {
        console.error("FROST publication failed:");
        const frostError = error.response?.data;
        const errorMessage = typeof frostError?.message === "string"
            ? frostError.message
            : typeof frostError === "string"
                ? frostError
                : error.message || "Unknown error while publishing to FROST Server.";
        const upstreamStatus = error.response?.status ?? frostError?.code;
        console.error(frostError || error.message || error);
        return res.status(502).json({
            success: false,
            messageKey: "strings.frostPublishFailed",
            message: `Could not publish the KPI to the FROST Server: ${errorMessage}`,
            details: frostError ?? error.message ?? "Unknown error.",
            frost: upstreamStatus ? { status: upstreamStatus } : undefined
        });
    }
}
async function getOrionKpiStatusController(req, res) {
    try {
        const result = await (0, orionPublisher_1.getOrionKpiStatus)(String(req.params.id));
        return res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        const upstreamStatus = error?.response?.status;
        return res.status(upstreamStatus && upstreamStatus >= 500 ? 502 : 500).json({
            success: false,
            messageKey: "strings.orionStatusCheckFailed",
            details: error?.response?.data || error?.message || "Could not check Orion entity status."
        });
    }
}
async function deleteKpiFromOrionController(req, res) {
    const kpiId = String(req.params.id);
    try {
        const result = await (0, orionPublisher_1.deleteKpiFromOrion)(kpiId);
        return res.status(200).json({
            success: true,
            messageKey: "strings.orionDeleteSuccess",
            ...result
        });
    }
    catch (error) {
        const upstreamStatus = error?.response?.status;
        if (upstreamStatus === 404) {
            return res.status(404).json({
                success: false,
                messageKey: "strings.orionDeleteNotFound",
                entityUrl: (0, orionPublisher_1.getOrionKpiEntityUrl)(kpiId)
            });
        }
        return res.status(upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 500 ? upstreamStatus : 502).json({
            success: false,
            messageKey: "strings.orionDeleteFailed",
            details: error?.response?.data || error?.message || "Could not delete Orion entity."
        });
    }
}
