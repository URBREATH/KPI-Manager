import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Source } from "./Source";
import { HttpMethod } from "../utils/enum";
import { Expose } from "class-transformer";

@Entity()
export class Spec {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column({ nullable: true, type: "text" }) //In case the select of the datasource type is mongoDB the jsonPath should be used to select the data
    @Expose()
    jsonPath: string;

    @Column({ type: "enum", enum: HttpMethod, default: HttpMethod.GET })
    @Expose()
    method: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    body: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    headers: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    query: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    collectionName: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    bucket: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    organization: string;

    @OneToOne(() => Source, (source) => source.spec_FK, { nullable: false })
    source: Source;
}
