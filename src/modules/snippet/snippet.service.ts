import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSnippetDto, GetAllSnippetsDto } from "./dto/snippet";
import { RpcException } from "@nestjs/microservices";
import { Snippet } from "./domain/entities/snippet";
import { Language } from "./domain/entities/language";
import { SnippetEntity } from "./infrastructure/snippet";
import { OutboxEntity } from "../outbox/infrastructure/outbox";
import { Outbox } from "../outbox/domain/outbox";

@Injectable()
export class SnippetService {
	private readonly logger = new Logger(SnippetService.name);

	constructor(@InjectRepository(SnippetEntity) private snippetRepository: Repository<SnippetEntity>) {}

	public getAllSnippets(query: GetAllSnippetsDto) {
		this.logger.log("Getting all snippets");
		return this.snippetRepository.find({
			order: {
				created_at: "DESC"
			},
			where: {
				...(query.language && { language: query.language })
			}
		});
	}

	public async createSnippet({ code, language }: CreateSnippetDto) {
		this.logger.log("Creating a new snippet");

		const snippet = Snippet.create({
			code,
			language: Language.create(language)
		});

		const outbox = Outbox.create({
			type: "snippet.created",
			payload: {
				id: snippet.id,
				code: snippet.code,
				language: snippet.language.value
			}
		});

		if (await this.doesCodeExists(snippet.code_hash)) {
			this.logger.warn(`Snippet with this code already exists: ${snippet.code_hash.toString("hex")}`);
			throw new RpcException({
				status: HttpStatus.CONFLICT,
				message: "Snippet with this code already exists"
			});
		}

		return await this.snippetRepository.manager.transaction(async (manager) => {
			const outbox_to_save = manager.create(OutboxEntity, {
				id: outbox.id,
				type: outbox.type,
				payload: outbox.payload
			});

			await manager.save(outbox_to_save);

			const snippet_to_save = manager.create(SnippetEntity, {
				id: snippet.id,
				code: snippet.code,
				code_hash: snippet.code_hash,
				language: snippet.language.value
			});

			return await manager.save(snippet_to_save);
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
