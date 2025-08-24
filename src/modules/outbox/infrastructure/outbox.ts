import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OutboxStatus } from "../domain/outbox";

@Entity()
export class OutboxEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 100 })
	type: string;

	@Column({ type: "jsonb" })
	payload: JSON;

	@Column({ type: "enum", enum: OutboxStatus, default: OutboxStatus.PENDING })
	status: OutboxStatus;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@Column({ type: "timestamp", nullable: true })
	processedAt: Date | null;
}
