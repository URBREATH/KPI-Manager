import { Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "kpi_orion_publications" })
export class OrionPublication {
    @PrimaryColumn({ type: "text" })
    kpiId!: string;

    @Column({ type: "text" })
    tenantId!: string;

    @Column({ type: "text" })
    entityId!: string;

    @Column({ type: "text" })
    entityUrl!: string;

    @UpdateDateColumn({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
    publishedAt!: Date;
}
