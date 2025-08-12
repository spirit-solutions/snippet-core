import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetService } from "./snippet.service";
import { SnippetController } from "./snippet.controller";
import { Snippet } from "../domain/snippet";

@Module({
	imports: [TypeOrmModule.forFeature([Snippet])],
	providers: [SnippetService],
	controllers: [SnippetController]
})
export class SnippetModule {}
