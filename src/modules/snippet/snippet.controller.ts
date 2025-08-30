import { Body, Controller } from "@nestjs/common";
import { SnippetService } from "./snippet.service";
import { MessagePattern } from "@nestjs/microservices";
import { CreateSnippetDto, GetAllSnippetsDto } from "./dto/snippet";
import { SnippetEntity } from "./infrastructure/snippet";

@Controller()
export class SnippetController {
	constructor(private readonly snippetService: SnippetService) {}

	@MessagePattern({ cmd: "get_all_snippets" })
	async getAllSnippets(data: GetAllSnippetsDto): Promise<SnippetEntity[]> {
		return await this.snippetService.getAllSnippets(data);
	}

	@MessagePattern({ cmd: "create_snippet" })
	async createSnippet(@Body() data: CreateSnippetDto): Promise<SnippetEntity> {
		return await this.snippetService.createSnippet(data);
	}
}
