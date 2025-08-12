import { Controller } from "@nestjs/common";
import { SnippetService } from "./snippet.service";
import { MessagePattern } from "@nestjs/microservices";
import { Snippet } from "../domain/snippet";

@Controller()
export class SnippetController {
	constructor(private readonly snippetService: SnippetService) {}

	@MessagePattern({ cmd: "get_all_snippets" })
	async getSnippet(): Promise<Snippet[]> {
		return await this.snippetService.getAll();
	}
}
