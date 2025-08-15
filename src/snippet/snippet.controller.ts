import { Body, Controller } from "@nestjs/common";
import { SnippetService } from "./snippet.service";
import { MessagePattern } from "@nestjs/microservices";
import { Snippet } from "../domain/snippet";
import { CreateSnippetDto } from "./dto/create-snippet.dto";

@Controller()
export class SnippetController {
	constructor(private readonly snippetService: SnippetService) {}

	@MessagePattern({ cmd: "get_all_snippets" })
	async getSnippet(): Promise<Snippet[]> {
		return await this.snippetService.getAll();
	}

	@MessagePattern({ cmd: "create_snippet" })
	async createSnippet(@Body() data: CreateSnippetDto): Promise<Snippet> {
		return await this.snippetService.createSnippet(data);
	}
}
