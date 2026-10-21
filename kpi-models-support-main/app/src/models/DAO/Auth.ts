import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { Source } from "./Source";
import { Expose } from "class-transformer";

@Entity()
export class Auth {
    @PrimaryGeneratedColumn("uuid")
    @Expose({ name: "id" })
    id_PK: string;

    @Column({ nullable: true, type: "text" })
    secretPath: string;

    @Column({ nullable: true, type: "text" })
    @Expose({ name: "databaseName" })
    database_name: string;

    @OneToOne(() => Source, (source) => source.auth)
    source_FK: Source;
}
