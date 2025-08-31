import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SnippetEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text" })
	code: string;

	@Column({ type: "bytea", unique: true, select: false })
	code_hash: Uint8Array;

	@Column({ type: "varchar", length: 50 })
	language: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: Date;

	@Column({ type: "int", generated: "increment", unique: true })
	sequence: number;
}
