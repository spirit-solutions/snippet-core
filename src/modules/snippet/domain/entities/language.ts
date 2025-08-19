import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import z from "zod";

export class Language {
	private constructor(public readonly value: SupportedLanguages) {
		if (!SUPPORTED_LANGUAGES.includes(value)) {
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: `Unsupported language: ${value}.`
			});
		}
	}

	public static create(value: SupportedLanguages): Language {
		const validationResult = language.safeParse(value);

		if (!validationResult.success) {
			const errorMessages = validationResult.error.issues.map(issue => issue.message).join("; ");
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: errorMessages
			});
		}

		return new Language(value);
	}
}

export const SUPPORTED_LANGUAGES = ["javascript", "python", "typescript"] as const;
export const language = z.enum(SUPPORTED_LANGUAGES);

export const languageSchema = z.custom<Language>(
	val => val instanceof Language,
	{
		message: "Input is not an instance of Language"
	}
);

export type SupportedLanguages = typeof SUPPORTED_LANGUAGES[number];
