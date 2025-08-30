import { IsEnum, IsOptional, IsString } from "class-validator";
import { SUPPORTED_LANGUAGES, type SupportedLanguages } from "../domain/entities/language";

export class CreateSnippetDto {
	@IsString()
	code: string;

	@IsEnum(SUPPORTED_LANGUAGES)
	language: SupportedLanguages;
}

export class GetAllSnippetsDto {
	@IsEnum(SUPPORTED_LANGUAGES)
	@IsOptional()
	language: SupportedLanguages;
}
