import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { SUPPORTED_LANGUAGES, type SupportedLanguages } from "../domain/entities/language";

export class GetSnippetByIdDto {
	@IsUUID()
	id: string;
}

export class CreateSnippetDto {
	@IsString()
	code: string;

	@IsEnum(SUPPORTED_LANGUAGES)
	language: SupportedLanguages;
}

export class GetAllSnippetsDto {
	@IsEnum(SUPPORTED_LANGUAGES)
	@IsOptional()
	language?: SupportedLanguages;
}
