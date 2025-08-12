import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Snippet {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "text" })
	code: string;
}
