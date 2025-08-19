import { IsString } from "class-validator";
import { type SupportedLanguages } from "../domain/entities/language";

export class CreateSnippetDto {
	@IsString()
	code: string;

	// TODO: Maybe use Enum instead of string
	@IsString()
	language: SupportedLanguages;
}
