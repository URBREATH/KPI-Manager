import { Expose, Type } from "class-transformer";
import 'reflect-metadata';
import { typeDetails } from "../utils/enum";


export class FormulaDto {

    @Expose({ name: "id_PK" })
    id?: string;

    @Expose()
    expression: string;

    @Expose()
    @Type(() => DetailsDto)
    details: DetailsDto[];


}

export class DetailsDto {

    @Expose()
    @Type(() => String)
    id?: string;

    @Expose()
    type: typeDetails;

    @Expose()
    @Type(() => String)
    name: string;
}