import z from "zod";
import { v7 } from "uuid";
import { Language, languageSchema } from "./language";
import { createHash } from "node:crypto";
import { RpcException } from "@nestjs/microservices";
import { HttpStatus } from "@nestjs/common";

export class Snippet {
	public static MIN_CODE_LENGTH = 5;
	public static MAX_CODE_LENGTH = 8192;

	public get id(): string {
		return this._id;
	}

	public get code(): string {
		return this._code;
	}

	public get language(): Language {
		return this._language;
	}

	public get code_hash(): Buffer {
		return this._code_hash;
	}

	private constructor(
		private readonly _id: string,
		private readonly _code: string,
		private readonly _language: Language,
		private readonly _code_hash: Buffer
	) {}

	/**
	 * Calculate the SHA-256 hash of the given code.
	 *
	 * @param code normalized code (trimmed and without extra whitespace)
	 * @returns SHA-256 hash of the code
	 */
	public static generateCodeHash(code: string): Buffer {
		return createHash("sha256").update(code).digest();
	}

	public static create(data: CreateSnippetEntity): Snippet {
		const validationResult = createSnippetEntitySchema.safeParse(data);

		if (!validationResult.success) {
			const errorMessages = validationResult.error.issues.map(issue => issue.message).join("; ");
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: errorMessages
			});
		}

		const { code, language } = validationResult.data;

		return new Snippet(
			v7(),
			code,
			language,
			Snippet.generateCodeHash(code)
		);
	}
}

const createSnippetEntitySchema = z.object({
	code: z
		.string()
		.trim()
		.min(Snippet.MIN_CODE_LENGTH)
		.max(Snippet.MAX_CODE_LENGTH),
	language: languageSchema
});

type CreateSnippetEntity = z.infer<typeof createSnippetEntitySchema>;
