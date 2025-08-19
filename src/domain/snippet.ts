import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Snippet {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text" })
	code: string;

	@Column({ type: "bytea", unique: true })
	code_hash: Uint8Array;
}
