import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from "typeorm";
import { Formula } from "./Formula";
import { GeoLocation } from "./GeoLocation";
import { Expose, Type } from "class-transformer";
import { Job } from "./Job";
import {dependencyStatus, typeDetails} from "../utils/enum";
import {Scope} from "./Scope";

@Entity()
export class Kpi {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    ownerId: string;

    @Column({nullable: true, type: "text"})
    @Expose()
    tenantId: string;

    @Column({ nullable: false, type: "text", unique: true })
    @Expose()
    name: string;

    @Column({type: "enum", enum: dependencyStatus, default: dependencyStatus.active})
    @Expose({ name: "dependencyStatus"})
    dependency_status: dependencyStatus;

    @Column({ nullable: false, type: "text" })
    @Expose({ name: "unitMeasure" })
    unit_measure: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    description: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    context: string;

    @UpdateDateColumn({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    @Expose({ name: "lastUpdate" })
    last_update: Date;

    @Column({ nullable: true, type: "float", default: 0 })
    @Expose({ name: "lastValue" })
    last_value: number;

    @Column({ nullable: false, type: "float" })
    @Expose({ name: "targetValue" })
    target_value: number;

    @Column({ nullable: true, type: "json" })
    @Expose({ name: "selected" })
    @Type(() => SelectedSource)
    selected: SelectedSource[];

    @Column({nullable: true, type: "json"})
    @Expose()
    @Type(() => Scope)
    scope: Scope;

    @Column({nullable: true, type: "json"})
    @Expose({ name: "dashboard" })
    dashboard: object;


    @OneToOne(() => Formula, Formula => Formula.kpi, { cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    @JoinColumn({ name: "formula_FK" })
    @Expose({ name: "formula" })
    @Type(() => Formula)
    formula_FK: Formula;

    @OneToOne(() => Job, job => job.kpi, { cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    @JoinColumn({ name: "job_FK" })
    @Expose({ name: "job" })
    @Type(() => Job)
    job_FK: Job;

    @Column({ nullable: true, type: "json" })
    @Expose({ name: "geolocation" })
    geolocation: GeoLocation;
    
}

class SelectedSource {
    @Expose()
    id: string;
    @Expose()
    type: typeDetails;
    @Expose()
    name: string;
}
