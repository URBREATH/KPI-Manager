import { Expose, Type } from "class-transformer";
import { MeasureType } from "../utils/enum";


export class AuthDto {

    @Expose({ name: "id_PK" })
    id?: string;

    @Expose()
    username?: string;

    @Expose({ name: "access_key" }) // TODO: Delete this line when the vault will be implemented
    accessKey?: string;

    @Expose()
    secretPath?: string;

    @Expose({ name: "database_name" })
    databaseName?: string;

}

export class SpecDto {

    @Expose({ name: "id_PK" })
    id?: string;

    @Expose()
    jsonPath?: string;

    @Expose()
    method?: string;

    @Expose()
    body?: string;

    @Expose()
    headers?: string;

    @Expose()
    query?: string;

    @Expose()
    collectionName?: string;

    @Expose()
    bucket?: string;

    @Expose()
    organization?: string;

}

export class SourceDto {

    @Expose({ name: "id_PK" })
    id?: string;

    @Expose()
    uri: string;

    @Expose()
    port?: number;

    @Expose()
    @Type(() => AuthDto)
    auth?: AuthDto;

    @Expose({ name: "spec_FK" })
    @Type(() => SpecDto)
    spec: SpecDto;

    @Expose()
    @Type(() => String)
    type: MeasureType;
}
