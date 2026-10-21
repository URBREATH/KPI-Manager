import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Auth } from "./Auth";
import { Spec } from "./Spec";
import { Measure } from "./Measure";
import { MeasureType } from "../utils/enum";
import { Expose, Type } from "class-transformer";

@Entity()
export class Source {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column({ nullable: false, type: "text" })
    @Expose()
    uri: string;

    @Column({ nullable: true, type: "integer" })
    @Expose()
    port: number;

    @OneToOne(() => Auth, (auth) => auth.source_FK, { nullable: true, cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    @JoinColumn()
    @Expose()
    @Type(() => Auth)
    auth: Auth;
    //Auth opzionale

    @OneToOne(() => Spec, (spec) => spec.source, { nullable: false, cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    @JoinColumn()
    @Expose({ name: "spec" })
    @Type(() => Spec)
    spec_FK: Spec;
    //Spec obbligatorio, required

    @Column({ nullable: false, type: "enum", enum: MeasureType }) //dropdown da frontend, default
    @Expose()
    type: MeasureType;

    @OneToOne(() => Measure, (measure) => measure.source)
    measure_FK: Measure;
}
