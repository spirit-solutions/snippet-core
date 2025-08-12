import { Module } from "@nestjs/common";
import { SnippetController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
	imports: [],
	controllers: [SnippetController],
	providers: [AppService]
})
export class AppModule {}
