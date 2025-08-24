import { Module } from "@nestjs/common";
import { OutboxService } from "./outbox.service";
import { OutboxPublisher } from "./outbox.publisher";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OutboxEntity } from "./infrastructure/outbox";
import { SearchModule } from "../search/search.module";

@Module({
	imports: [TypeOrmModule.forFeature([OutboxEntity]), SearchModule],
	providers: [OutboxService, OutboxPublisher]
})
export class OutboxModule {}
