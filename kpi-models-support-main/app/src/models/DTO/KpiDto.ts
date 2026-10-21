import { Expose, Type } from "class-transformer";
import { FormulaDto } from "./FormulaDto";
import { GeoLocationDto } from "./GeoLocationDto";
import { JobDto } from "./JobDto";
import {dependencyStatus} from "../utils/enum";
import {ScopeDto} from "./ScopeDto";

class SelectedSource {
    @Expose()
    id?: string;
    @Expose()
    type: string;
    @Expose()
    name: string;
}


class Definition {
    @Expose()
    @Type(() => GeoLocationDto)
    geolocation: GeoLocationDto;

    @Expose({ name: "unit_measure" })
    unitMeasure: string;

    @Expose({ name: "target_value" })
    targetValue: number;

    @Expose({ name: "selected" })
    @Type(() => SelectedSource)
    selected: SelectedSource[];

}

export class KpiDto {

    @Expose({ name: "id_PK" })
    id?: string;

    @Expose()
    name: string;

    @Expose({ name: "dependency_status"})
    dependencyStatus: dependencyStatus;

    @Expose()
    ownerId?: string;

    @Expose()
    tenantId?: string;

    @Expose()
    description?: string;

    @Expose()
    context: string;

    @Expose()
    @Type(() => Definition)
    definition: Definition;

    @Expose({ name: "last_update" })
    lastUpdate: Date;

    @Expose({ name: "last_value" })
    lastValue: number;

    @Expose({ name: "dashboard" })
    dashboard: object;

    @Expose({ name: "formula_FK" })
    @Type(() => FormulaDto)
    formula: FormulaDto;

    @Expose({ name: "job_FK" })
    @Type(() => JobDto)
    job: JobDto;

    @Expose({name: "scope"})
    @Type(() => ScopeDto)
    scope?: ScopeDto;

}
