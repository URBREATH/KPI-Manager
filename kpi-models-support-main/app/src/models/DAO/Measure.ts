import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Source } from './Source';
import { Expose, Type } from 'class-transformer';
import {Scope} from "./Scope";

@Entity()
export class Measure {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column({ nullable: false, type: "text", unique: true })
    @Expose()
    name: string;

    @Column({nullable: true, type: "text"})
    @Expose()
    context: string;

    @Column({nullable: true, type: "text"})
    @Expose()
    tenantId: string;

    @Column({ nullable: true, type: "text" })
    ownerId: string;

    @Column({ nullable: true, type: "text" })
    @Expose()
    description: string

    @Column({nullable: true, type: "json"})
    @Expose()
    @Type(() => Scope)
    scope: Scope;

    @OneToOne(() => Source, source => source.measure_FK, { cascade: ["insert", "update", "remove", "soft-remove", "recover"] })
    @JoinColumn()
    @Expose()
    @Type(() => Source)
    source: Source;
}

