import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snippet } from "../domain/snippet";

@Injectable()
export class SnippetService {
	constructor(@InjectRepository(Snippet) private snippetRepository: Repository<Snippet>) {}

	getAll() {
		return this.snippetRepository.find();
	}
}
