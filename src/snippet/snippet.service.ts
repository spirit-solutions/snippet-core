import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snippet } from "../domain/snippet";
import { CreateSnippetDto } from "./dto/create-snippet.dto";

@Injectable()
export class SnippetService {
	constructor(@InjectRepository(Snippet) private snippetRepository: Repository<Snippet>) {}

	getAll() {
		return this.snippetRepository.find();
	}

	createSnippet(data: CreateSnippetDto) {
		return this.snippetRepository.save({
			code: data.code
		});
	}
}
