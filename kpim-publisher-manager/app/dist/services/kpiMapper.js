"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNgsiLd = toNgsiLd;
function toNgsiLd(kpi, options = {}) {
    console.log("metodo tongsild");
    console.log(kpi);
    const entity = {
        id: `urn:ngsi-ld:KPI:${kpi.id}`,
        type: "KeyPerformanceIndicator",
        name: {
            type: "Property",
            value: kpi.name
        },
        description: {
            type: "Property",
            value: kpi.description || ""
        },
        /* currentStanding: {
             type: "Property",
             value: kpi.lastValue >= (kpi.definition?.targetValue ?? 0) ? "good" : "bad"
         },*/
        kpiValue: {
            type: "Property",
            value: kpi.lastValue
        },
        category: {
            type: "Property",
            value: ["quantitative"] // puoi parametrizzare se vuoi
        },
        dateModified: {
            type: "Property",
            value: kpi.lastUpdate
        },
        calculationFrequency: {
            type: "Property",
            value: mapScheduleToFrequency(kpi.formula.job.schedule)
        },
        calculationMethod: {
            type: "Property",
            value: "automatic" // o "manual" se vuoi derivarlo
        },
        calculationFormula: {
            type: "Property",
            value: kpi.formula?.expression || ""
        },
        provider: {
            type: "Property",
            value: {
                name: kpi.ownerName || "unknown"
            }
        },
        organization: {
            type: "Property",
            value: {
                name: kpi.tenantId || "unknown"
            }
        },
        /*definition: {
            type: "Property",
            value: {
                targetValue: kpi.definition?.targetValue,
                unitMeasure: kpi.definition?.unitMeasure,
                selected: kpi.definition?.selected
            }
        },*/
        "@context": [
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
        ]
    };
    // se viene passato datasetId lo aggiungiamo
    if (options?.datasetId) {
        entity.kpiValue.datasetId = options.datasetId;
    }
    if (kpi.definition.geolocation.longitude != "" && kpi.definition.geolocation.longitude != "") {
        entity.location = {
            type: "GeoProperty",
            value: { type: "Point", coordinates: [kpi.definition.geolocation.longitude, kpi.definition.geolocation.latitude] }
        };
    }
    return entity;
}
function mapScheduleToFrequency(schedule) {
    console.log('map schedule frequency');
    console.log(schedule);
    if (!schedule)
        return "unknown";
    const { time, value } = schedule;
    // Mapping semplice
    if (time === "minute") {
        return `${value} minutes`;
    }
    if (time === "hour") {
        return value === 1 ? "hourly" : `${value} hours`;
    }
    if (time === "day") {
        return value === 1 ? "daily" : `${value} days`;
    }
    if (time === "week") {
        return value === 1 ? "weekly" : `${value} weeks`;
    }
    if (time === "month") {
        if (value === 1)
            return "monthly";
        if (value === 2)
            return "bimonthly";
        if (value === 3)
            return "quarterly";
        if (value === 6)
            return "biannual";
        return `${value} months`;
    }
    if (time === "year") {
        return value === 1 ? "yearly" : `${value} years`;
    }
    // fallback
    return `${value} ${time}${value > 1 ? "s" : ""}`;
}
