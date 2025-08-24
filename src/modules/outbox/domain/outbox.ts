import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { v7 } from "uuid";
import z from "zod";

export enum OutboxStatus {
	PENDING = "pending",
	PROCESSED = "processed",
	FAILED = "failed"
}

export class Outbox {
	public static MIN_TYPE_LENGTH = 2;
	public static MAX_TYPE_LENGTH = 100;

	private constructor(
		public readonly id: string,
		public readonly type: string,
		public readonly payload: object,
		public readonly status: OutboxStatus,
		public readonly createdAt: Date,
		public readonly processedAt: Date | null
	) {}

	public static create(data: CreateOutboxEntityInput) {
		const validationResult = createOutboxEntitySchema.safeParse(data);

		if (!validationResult.success) {
			const errorMessages = validationResult.error.issues.map(issue => issue.message).join("; ");
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: errorMessages
			});
		}

		return new Outbox(
			v7(),
			validationResult.data.type,
			validationResult.data.payload,
			OutboxStatus.PENDING,
			new Date(),
			null
		);
	}
}

const createOutboxEntitySchema = z.object({
	type: z.string().min(Outbox.MIN_TYPE_LENGTH).max(Outbox.MAX_TYPE_LENGTH),
	payload: z.object({}).catchall(z.any())
});

type CreateOutboxEntityInput = z.infer<typeof createOutboxEntitySchema>;
