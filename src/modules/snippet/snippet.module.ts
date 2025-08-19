import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetService } from "./snippet.service";
import { SnippetController } from "./snippet.controller";
import { SnippetEntity } from "./infrastructure/snippet";

@Module({
	imports: [TypeOrmModule.forFeature([SnippetEntity])],
	providers: [SnippetService],
	controllers: [SnippetController]
})
export class SnippetModule {}
