import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import z from "zod";

export const languageSchema = z.custom<Language>(
	val => val instanceof Language,
	{
		message: "Input is not an instance of Language"
	}
);

export const SUPPORTED_LANGUAGES = ["javascript", "python", "typescript"] as const;

export type SupportedLanguages = typeof SUPPORTED_LANGUAGES[number];

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
		return new Language(value);
	}
}
