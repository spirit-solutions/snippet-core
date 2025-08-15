import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Snippet {
	@PrimaryGeneratedColumn("uuid")
	id: number;

	@Column({ type: "text" })
	code: string;
}
