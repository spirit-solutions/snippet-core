import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxEntity } from "./infrastructure/outbox";
import { OutboxStatus } from "./domain/outbox";
import { SearchService } from "../search/search.service";

// TODO: Implement concurrency per partition key

@Injectable()
export class OutboxPublisher {
	private readonly logger = new Logger(OutboxPublisher.name);

	constructor(
		@InjectRepository(OutboxEntity) private outboxRepository: Repository<OutboxEntity>,
		private readonly searchService: SearchService
	) {}

	@Cron(CronExpression.EVERY_10_SECONDS)
	async handleCron() {
		this.logger.debug("Polling outbox for pending messages");

		return await this.outboxRepository.manager.transaction(async (manager) => {
			const messages = await manager.find(OutboxEntity, {
				where: [
					{ status: OutboxStatus.PENDING },
					{ status: OutboxStatus.FAILED }
				],
				order: { createdAt: "ASC" },
				take: 100,
				lock: { mode: "pessimistic_write" }
			});

			if (messages.length === 0) {
				this.logger.debug("No pending messages found.");
				return 0;
			}

			this.logger.log(`Found ${messages.length} pending messages.`);

			for (const message of messages) {
				try {
					await this.searchService.sendMessage(message.type, message.payload);
					await manager.update(OutboxEntity, { id: message.id }, {
						status: OutboxStatus.PROCESSED,
						processedAt: new Date()
					});
					this.logger.log(`Successfully processed message ${message.id}`);
				}
				catch (error) {
					message.status = OutboxStatus.FAILED;
					this.logger.error(`Failed to process message ${message.id}`, error);
				}
			}
		});
	}
}
