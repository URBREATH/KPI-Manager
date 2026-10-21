import {plainToInstance} from "class-transformer";
import {ResponseDTO} from "./models/DTO/ResponseDto";
import {Kpi} from "./models/DAO/Kpi";
import {JobStatus, unitMeasure} from "./models/utils/enum";

export function mapToClass<T>(json: object, classType: new () => T): T {
    if (classType === Kpi) {
        json = normalizeKpiDto(json);
    }
    return plainToInstance(classType, json, { excludeExtraneousValues: true });
}


export function createResponseDto(message: string, status: number, data: object): ResponseDTO {
    return {
        message,
        data,
        status
    };
}

export function normalizeKpiDto(kpiDto: any): object {
    return {
        id: kpiDto.id ?? undefined,
        name: kpiDto.name,
        ownerId: kpiDto.ownerId,
        tenantId: kpiDto.tenantId,
        dependencyStatus: kpiDto.dependencyStatus,
        unitMeasure: <unitMeasure>kpiDto.definition.unitMeasure,
        description: kpiDto.description,
        context: kpiDto.context,
        lastUpdate: kpiDto.lastUpdate,
        lastValue: kpiDto.lastValue,
        targetValue: kpiDto.definition.targetValue,
        selected: kpiDto.definition.selected,
        formula: kpiDto.formula,
        job: kpiDto.formula.job,
        geolocation: kpiDto.definition.geolocation,
        dashboard: kpiDto.dashboard,
        scope: kpiDto.scope
    }
}

export function mapKpiDaoToKpiDto(kpiDto: Kpi): object {
    return {
        id: kpiDto.id_PK,
        name: kpiDto.name,
        ownerId: kpiDto.ownerId,
        tenantId: kpiDto.tenantId,
        dependencyStatus: kpiDto.dependency_status,
        description: kpiDto.description,
        context: kpiDto.context,
        lastUpdate: kpiDto.last_update,
        lastValue: kpiDto.last_value,
        definition: {
            targetValue: kpiDto.target_value,
            geolocation: kpiDto.geolocation,
            selected: kpiDto.selected,
            unitMeasure: kpiDto.unit_measure
        },
        formula: {
            id: kpiDto.formula_FK.id_PK,
            expression: kpiDto.formula_FK.expression,
            details: kpiDto.formula_FK.details,
            job: {
                id: kpiDto.job_FK.id_PK,
                status: kpiDto.job_FK.status ?? JobStatus.NULL,
                schedule: kpiDto.job_FK.schedule,
                cronJobId: kpiDto.job_FK.cronJobId

            }
        },
        scope: kpiDto.scope,
        dashboard: kpiDto.dashboard
    }
}

