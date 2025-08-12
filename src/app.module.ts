import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetModule } from "./snippet/snippet.module";
import { Snippet } from "./domain/snippet";

@Module({
	imports: [
		SnippetModule,
		TypeOrmModule.forRoot({
			type: "postgres",
			host: "localhost",
			port: 5432,
			username: "tereza",
			password: "cervenytrakturek",
			database: "swa",
			entities: [Snippet],
			synchronize: true
		})
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
