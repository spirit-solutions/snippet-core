import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Snippet } from "../domain/snippet";
import { CreateSnippetDto } from "./dto/create-snippet.dto";
import { createHash } from "node:crypto";
import { RpcException } from "@nestjs/microservices";

@Injectable()
export class SnippetService {
	private readonly logger = new Logger(SnippetService.name);

	constructor(@InjectRepository(Snippet) private snippetRepository: Repository<Snippet>) {}

	public getAll() {
		this.logger.log("Getting all snippets");
		return this.snippetRepository.find();
	}

	public async createSnippet(data: CreateSnippetDto) {
		this.logger.log("Creating a new snippet", data);

		// normalize
		data.code = data.code.trim();

		const code_hash = this.calculateCodeHash(data.code);
		if (await this.doesCodeExists(code_hash)) {
			this.logger.warn(`Snippet with this code already exists: ${code_hash.toString("hex")}`);
			throw new RpcException({
				status: HttpStatus.CONFLICT,
				message: "Snippet with this code already exists"
			});
		}

		return this.snippetRepository.save({
			code: data.code,
			code_hash: this.calculateCodeHash(data.code)
		});
	}

	/**
	 * Calculate the SHA-256 hash of the given code.
	 *
	 * @param code normalized code (trimmed and without extra whitespace)
	 * @returns SHA-256 hash of the code
	 */
	private calculateCodeHash(code: string): Buffer {
		return createHash("sha256").update(code).digest();
	}

	/**
	 * Check if a snippet with the given code hash already exists.
	 *
	 * @param value string or Buffer
	 */
	private doesCodeExists(value: string | Uint8Array<ArrayBufferLike>) {
		return this.snippetRepository.exists({
			where: {
				code_hash: typeof value === "string" ? this.calculateCodeHash(value) : value
			}
		});
	}
}
