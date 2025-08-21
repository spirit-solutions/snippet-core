import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { RpcException } from "@nestjs/microservices";
import { Snippet } from "./domain/entities/snippet";
import { Language } from "./domain/entities/language";
import { SnippetEntity } from "./infrastructure/snippet";
import { SearchService } from "../search/search.service";

@Injectable()
export class SnippetService {
	private readonly logger = new Logger(SnippetService.name);

	constructor(
		@InjectRepository(SnippetEntity) private snippetRepository: Repository<SnippetEntity>,
		private searchService: SearchService
	) {}

	public getAll() {
		this.logger.log("Getting all snippets");
		return this.snippetRepository.find();
	}

	public async createSnippet({ code, language }: CreateSnippetDto) {
		this.logger.log("Creating a new snippet");

		const snippet = Snippet.create({
			code,
			language: Language.create(language)
		});

		if (await this.doesCodeExists(snippet.code_hash)) {
			this.logger.warn(`Snippet with this code already exists: ${snippet.code_hash.toString("hex")}`);
			throw new RpcException({
				status: HttpStatus.CONFLICT,
				message: "Snippet with this code already exists"
			});
		}

		await this.searchService.onSnippetCreated(snippet);

		return this.snippetRepository.save({
			id: snippet.id,
			code: snippet.code,
			code_hash: snippet.code_hash,
			language: snippet.language.value
		});
	}

	/**
	 * Check if a snippet with the given code hash already exists.
	 *
	 * @param value string or Buffer
	 */
	private doesCodeExists(value: string | Buffer) {
		return this.snippetRepository.exists({
			where: {
				code_hash: typeof value === "string" ? Snippet.generateCodeHash(value) : value
			}
		});
	}
}
