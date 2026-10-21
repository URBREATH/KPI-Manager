import {TimeDTO, DateGranularity} from '@he_hurbreath/kpi-models-support-main';
import {TENANT_ID} from "./constants";

export function timeDTOToCron(timeDTO: TimeDTO): string {
    const { time, value } = timeDTO;

    switch (time) {
        case DateGranularity.minute:
            return `*/${value} * * * *`;
        case DateGranularity.hour:
            return `0 */${value} * * *`;
        case DateGranularity.day:
            return `0 0 */${value} * *`;
        case DateGranularity.week:
            return `0 0 * * ${value % 7}`;
        case DateGranularity.month:
            return `0 0 1 */${value} *`;
        case DateGranularity.quarter:
            return `0 0 1 1-12/${value * 3} *`;
        case DateGranularity.year:
            return `0 0 1 1 *`;
        default:
            throw new Error("Unsupported date granularity");
    }
}

export function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) return undefined;
    return value.toLowerCase() === 'true';
}

export function generateUniqueCronJobName(): string {
    return `formula-engine-${TENANT_ID}-${Math.random().toString(36).substring(5)}`;
}
