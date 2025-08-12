import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetModule } from "./snippet/snippet.module";
import { Snippet } from "./domain/snippet";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		SnippetModule,
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get<string>("POSTGRES_HOST"),
				port: 5432,
				username: configService.get<string>("POSTGRES_USERNAME"),
				password: configService.get<string>("POSTGRES_PASSWORD"),
				database: "swa",
				entities: [Snippet],
				synchronize: true
			})
		})
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
