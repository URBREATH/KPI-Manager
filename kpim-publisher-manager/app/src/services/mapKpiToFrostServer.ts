

export function mapKpiToSensor() {
    return {
        name: "KPI Manager",
        description: "KPI Manager Tool",
        encodingType: "application/json",
        metadata: "KPIM"
    };
}

export function mapKpiToThing(kpi: any) {
    return {
        name: kpi.name,
        description: kpi.description,
        properties: {
            id: kpi.id,
            ownerId: kpi.ownerId,
            tenantId: kpi.tenantId,
            context: kpi.context,
            dependencyStatus: kpi.dependencyStatus
        }
    };
}

export function mapKpiToLocation(kpi: any) {

    const geo = kpi.definition?.geolocation;

    if (!geo?.latitude || !geo?.longitude) {
        return null;
    }

    return {
        name: `${kpi.name} Location`,
        description: kpi.description || `Geographic location for KPI ${kpi.name}`,
        encodingType: "application/vnd.geo+json",
        location: {
            type: "Point",
            coordinates: [
                Number(geo.longitude),
                Number(geo.latitude)
            ]
        }
    };
}

export function mapKpiToObservedProperty(kpi: any) {

    return {
        name: kpi.description,
        description: kpi.description,
        definition: `kpi:${kpi.name}`
    };
}

export function mapKpiToDatastream(kpi: any, measures: any[]) {

    return {

        name: kpi.name,

        description: kpi.description,

        observationType: "http://www.opengis.net/def/observationType/OGC-OM/2.0/OM_Measurement",

        unitOfMeasurement: {
            name: kpi.definition.unitMeasure,
            symbol: kpi.definition.unitMeasure,
            definition: kpi.definition.unitMeasure
        },

        properties: {

            targetValue: kpi.definition.targetValue,

            context: kpi.context,

            dependencyStatus: kpi.dependencyStatus,

            formula: kpi.formula.expression,

            schedule: kpi.formula.job.schedule,

            dashboard: kpi.dashboard,

            sources: measures.map(mapMeasure)

        }

    };
}

export function mapKpiToObservation(kpi: any) {

    return {

        phenomenonTime: kpi.lastUpdate,

        resultTime: kpi.lastUpdate,

        result: kpi.lastValue

    };
}

function mapMeasure(measure: any) {

    const data = measure.data;

    return {

        id: data.id_PK,

        name: data.name,

        description: data.description,

        context: data.context,

        tenantId: data.tenantId,

        ownerId: data.ownerId,

        source: {

            id: data.source.id_PK,

            type: data.source.type,

            uri: data.source.uri,

            port: data.source.port,

            auth: data.source.auth,

            specification: {

                method: data.source.spec_FK.method,

                jsonPath: data.source.spec_FK.jsonPath,

                body: data.source.spec_FK.body,

                headers: data.source.spec_FK.headers,

                query: data.source.spec_FK.query,

                collectionName: data.source.spec_FK.collectionName,

                bucket: data.source.spec_FK.bucket,

                organization: data.source.spec_FK.organization

            }

        }

    };
}