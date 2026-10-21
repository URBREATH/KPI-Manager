import { Request, Response } from 'express';
import { toNgsiLd } from '../services/kpiMapper';
import { deleteKpiFromOrion, getOrionKpiStatus, getOrionKpiEntityUrl, publishToOrion } from '../services/orionPublisher';
import {publishNgsiBroker} from '../services/ngsiBrokerPublisher';
import {FROST_SERVER_URL, KPIM_MEASURE_MANAGER_API_URL, ORION_URL} from '../utils/constants';
import axios from 'axios';
import {mapKpiToDatastream, mapKpiToLocation, mapKpiToObservation, mapKpiToObservedProperty, mapKpiToSensor,mapKpiToThing} from '../services/mapKpiToFrostServer';
import {
    publishSensor,
    publishThing,
    publishLocation,
    publishObservedProperty,
    publishDatastream,
    publishObservation
} from "../services/frostServerPublisher";

export async function publishKpi(req: Request, res: Response) {
    try {
   
        console.log('sono qui');
        console.log(req.body);
        const kpi = req.body;

        const entity = toNgsiLd(kpi.item);
        console.log(entity);

     
        const result = await publishToOrion(entity);
        const entityUrl = result.location || getOrionKpiEntityUrl(kpi.item.id);

        return res.status(201).json({
            success: true,
            messageKey: "strings.orionPublishSuccess",
            entityUrl,
            entityId: entity.id
        });

    } catch (error: any) {
        console.error(error);
        const status = error?.response?.status || 500;
        const entity = req.body?.item ? toNgsiLd(req.body.item) : null;
        const entityUrl = req.body?.item?.id
            ? getOrionKpiEntityUrl(req.body.item.id)
            : entity?.id
                ? `${ORION_URL.replace(/\/+$/, '')}/ngsi-ld/v1/entities/${encodeURIComponent(entity.id)}`
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


export async function publishDataset(req: Request, res: Response) {
  try {
    console.log('publishDataset');
    console.log(req.body);

    const result = await publishNgsiBroker(
      req.body.distribution,
      req.body.dataset
    );

    return res.status(200).json(result);

  } catch (error: any) {
   console.error("Publish dataset error:", error);

    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Publish failed";

    return res.status(status).json({
      error: message
    });
  }
}





export async function publishFrostServer(
    req: Request,
    res: Response
) {

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

        const selectedMeasures =
            kpi.definition.selected
                .filter(
                    (item: any) =>
                        item.type === "measure"
                );


        const measures = await Promise.all(

            selectedMeasures.map(
                async (item: any) => {

                    const { data } = await axios.get(

                        `${KPIM_MEASURE_MANAGER_API_URL}` +
                        `/api/v1/measures/${item.id}`

                    );

                    return data;
                }
            )

        );


        console.log("Measures:");
        console.log(measures);


        // --------------------------------------------------
        // 2. Mapping KPI Manager -> FROST
        // --------------------------------------------------

        const sensor =
            mapKpiToSensor();

        const thing =
            mapKpiToThing(kpi);

        const location =
            mapKpiToLocation(kpi);

        const observedProperty =
            mapKpiToObservedProperty(kpi);

        const datastream =
            mapKpiToDatastream(
                kpi,
                measures
            );

        const observation =
            mapKpiToObservation(kpi);


        console.log("Mapped entities:");

        console.log("Sensor:", sensor);
        console.log("Thing:", thing);
        console.log("Location:", location);
        console.log(
            "ObservedProperty:",
            observedProperty
        );
        console.log(
            "Datastream:",
            datastream
        );
        console.log(
            "Observation:",
            observation
        );


        // --------------------------------------------------
        // 3. Publish Sensor
        // --------------------------------------------------

        const sensorId =
            await publishSensor(sensor);

        console.log(
            "Sensor ID:",
            sensorId
        );


        // --------------------------------------------------
        // 4. Publish Thing
        // --------------------------------------------------

        const thingId =
            await publishThing(thing);

        console.log(
            "Thing ID:",
            thingId
        );


        // --------------------------------------------------
        // 5. Publish Location
        // --------------------------------------------------

        let locationId: string | null = null;

        if (location) {

            locationId =
                await publishLocation(
                    location,
                    thingId
                );

            console.log(
                "Location ID:",
                locationId
            );
        }


        // --------------------------------------------------
        // 6. Publish ObservedProperty
        // --------------------------------------------------

        const observedPropertyId =
            await publishObservedProperty(
                observedProperty
            );

        console.log(
            "ObservedProperty ID:",
            observedPropertyId
        );


        // --------------------------------------------------
        // 7. Publish Datastream
        // --------------------------------------------------

        const datastreamId =
            await publishDatastream(
                datastream,
                sensorId,
                thingId,
                observedPropertyId
            );

        console.log(
            "Datastream ID:",
            datastreamId
        );


        // --------------------------------------------------
        // 8. Publish Observation
        // --------------------------------------------------

        const observationId =
            await publishObservation(
                observation,
                datastreamId
            );

        console.log(
            "Observation ID:",
            observationId
        );


        // --------------------------------------------------
        // 9. Response
        // --------------------------------------------------

        const frostBaseUrl = FROST_SERVER_URL.replace(/\/+$/, "");
        const reference = (collection: string, id: string | null) =>
            id === null ? null : `${frostBaseUrl}/${collection}(${encodeURIComponent(id)})`;

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

    catch (error: any) {

        console.error(
            "FROST publication failed:"
        );

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

export async function getOrionKpiStatusController(req: Request, res: Response) {
    try {
        const result = await getOrionKpiStatus(String(req.params.id));
        return res.status(200).json({ success: true, ...result });
    } catch (error: any) {
        const upstreamStatus = error?.response?.status;
        return res.status(upstreamStatus && upstreamStatus >= 500 ? 502 : 500).json({
            success: false,
            messageKey: "strings.orionStatusCheckFailed",
            details: error?.response?.data || error?.message || "Could not check Orion entity status."
        });
    }
}

export async function deleteKpiFromOrionController(req: Request, res: Response) {
    const kpiId = String(req.params.id);
    try {
        const result = await deleteKpiFromOrion(kpiId);
        return res.status(200).json({
            success: true,
            messageKey: "strings.orionDeleteSuccess",
            ...result
        });
    } catch (error: any) {
        const upstreamStatus = error?.response?.status;
        if (upstreamStatus === 404) {
            return res.status(404).json({
                success: false,
                messageKey: "strings.orionDeleteNotFound",
                entityUrl: getOrionKpiEntityUrl(kpiId)
            });
        }
        return res.status(upstreamStatus && upstreamStatus >= 400 && upstreamStatus < 500 ? upstreamStatus : 502).json({
            success: false,
            messageKey: "strings.orionDeleteFailed",
            details: error?.response?.data || error?.message || "Could not delete Orion entity."
        });
    }
}