import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SnippetService } from "./snippet.service";
import { Snippet } from "@/domain/snippet";
import { SnippetController } from "./snippet.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Snippet])],
	providers: [SnippetService],
	controllers: [SnippetController]
})
export class SnippetModule {}
