import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snippet } from "../domain/snippet";
import { CreateSnippetDto } from "./dto/create-snippet.dto";

@Injectable()
export class SnippetService {
	private readonly logger = new Logger(SnippetService.name);

	constructor(@InjectRepository(Snippet) private snippetRepository: Repository<Snippet>) {}

	getAll() {
		this.logger.log("Getting all snippets");
		return this.snippetRepository.find();
	}

	createSnippet(data: CreateSnippetDto) {
		this.logger.log("Creating a new snippet", data);
		return this.snippetRepository.save({
			code: data.code
		});
	}
}
