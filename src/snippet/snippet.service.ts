import { Snippet } from "@/domain/snippet";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class SnippetService {
	constructor(@InjectRepository(Snippet) private snippetRepository: Repository<Snippet>) {}

	getAll() {
		return this.snippetRepository.find();
	}
}
