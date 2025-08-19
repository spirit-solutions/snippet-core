import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetModule } from "./snippet/snippet.module";
import { Snippet } from "../domain/entities/snippet";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { configSchema } from "../env";

@Module({
	imports: [
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
				port: 5432,
				username: process.env.POSTGRES_USERNAME,
				password: process.env.POSTGRES_PASSWORD,
				database: "swa",
				entities: [Snippet],
				synchronize: true
			})
		}),
		HealthModule
	]
})
export class AppModule {}
