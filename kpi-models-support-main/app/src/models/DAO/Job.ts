import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Schedule } from "./Schedule";
import { JobStatus } from "../utils/enum";
import { Expose, Type } from "class-transformer";
import { Kpi } from "./Kpi";

@Entity()
export class Job {

    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @OneToOne(() => Kpi, (Kpi) => Kpi.job_FK)
    kpi: Kpi;

    @Column({ type: "enum", enum: JobStatus, default: JobStatus.RUNNING })
    @Expose()
    status: string;

    @Column({ nullable: true, type: "json" })
    @Expose()
    @Type(() => Schedule)
    schedule: Schedule;

    @Column({ nullable: true, type: "text" })
    @Expose()
    @Type(() => String)
    cronJobId: string;
}

