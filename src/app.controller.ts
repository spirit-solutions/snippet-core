import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class SnippetController {
	constructor(private readonly appService: AppService) {}

	@MessagePattern({ cmd: "get_snippet" })
	getSnippet(): string {
		return "Snippet";
	}
}
