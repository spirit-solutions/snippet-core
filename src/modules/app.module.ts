import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetModule } from "./snippet/snippet.module";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { OutboxModule } from "./outbox/outbox.module";
import { configSchema } from "../env";
import { SnippetEntity } from "./snippet/infrastructure/snippet";
import { OutboxEntity } from "./outbox/infrastructure/outbox";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
	imports: [
		ScheduleModule.forRoot(),
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				".env",
				".env.dev",
				".env.prod"
			],
			validate(config) {
				return configSchema.parse(config);
			}
		}),
		SnippetModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: () => ({
				type: "postgres",
				host: process.env.POSTGRES_HOST,
				port: Number(process.env.POSTGRES_PORT ?? 5432),
				username: process.env.POSTGRES_USER,
				password: process.env.POSTGRES_PASSWORD,
				database: "swa",
				entities: [SnippetEntity, OutboxEntity],
				synchronize: true
			})
		}),
		HealthModule,
		OutboxModule
	]
})
export class AppModule {}
