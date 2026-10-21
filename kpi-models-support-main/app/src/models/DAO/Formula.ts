import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Kpi } from "./Kpi";
import { Expose, Type } from "class-transformer";
import { typeDetails } from "../utils/enum";

@Entity()
export class Formula {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column()
    @Expose()
    expression: string;

    @Column("json")
    @Expose()
    @Type(() => Details)
    details: Details[];

    @OneToOne(() => Kpi, (Kpi) => Kpi.formula_FK)
    kpi: Kpi;
}


export class Details {
    @Expose()
    id: string;
    @Expose()
    type: typeDetails;
    @Expose()
    name: string;
}