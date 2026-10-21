import { Expose, Type } from "class-transformer";
import { SourceDto } from "./SourceDto";
import {ScopeDto} from "./ScopeDto";


export class MeasureDto {
    @Expose({ name: "id_PK" })
    id?: string;
    @Expose()
    name: string;
    @Expose()
    context?: string;
    @Expose()
    ownerId?: string;
    @Expose()
    tenantId?: string;
    @Expose()
    description?: string;
    @Expose()
    scope?: ScopeDto
    @Expose()
    @Type(() => SourceDto)
    source: SourceDto;
}
