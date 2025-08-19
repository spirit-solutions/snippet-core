import { RpcException } from "@nestjs/microservices";
import { Language, SupportedLanguages } from "./language";
import { Snippet } from "./snippet";

describe.only("unit", () => {
	describe("Snippet Domain", () => {
		it("should create a Snippet with valid data", () => {
			const snippet = Snippet.create({
				code: "Hello, World!",
				language: Language.create("javascript")
			});

			expect(snippet).toBeInstanceOf(Snippet);
			expect(snippet.code).toEqual("Hello, World!");

			expect(snippet.language).toBeInstanceOf(Language);
			expect(snippet.language.value).toEqual("javascript");
		});

		it("should create snippet with code at minimum length", () => {
			const snippet = Snippet.create({
				code: "a".repeat(Snippet.MIN_CODE_LENGTH),
				language: Language.create("javascript")
			});
			expect(snippet.code).toEqual("a".repeat(Snippet.MIN_CODE_LENGTH));
		});

		it("should create snippet with code at maximum length", () => {
			const snippet = Snippet.create({
				code: "a".repeat(Snippet.MAX_CODE_LENGTH),
				language: Language.create("javascript")
			});
			expect(snippet.code).toEqual("a".repeat(Snippet.MAX_CODE_LENGTH));
		});

		it("should throw an error if code is too short", () => {
			expect(() => Snippet.create({
				code: "a".repeat(Snippet.MIN_CODE_LENGTH - 1),
				language: Language.create("javascript")
			})).toThrow(RpcException);
		});

		it("should throw an error if code is too long", () => {
			expect(() => Snippet.create({
				code: "a".repeat(Snippet.MAX_CODE_LENGTH + 1),
				language: Language.create("javascript")
			})).toThrow(RpcException);
		});

		it("should throw an error if language is not supported", () => {
			expect(() => Snippet.create({
				code: "Hello, World!",
				language: Language.create("unsupported" as SupportedLanguages)
			})).toThrow(RpcException);
		});

		it("should generate SHA256 hash from the code", () => {
			const snippet = Snippet.create({
				code: "Hello, World!",
				language: Language.create("javascript")
			});

			expect(snippet.code_hash.toString("hex")).toEqual("dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f");
		});

		it("should remove extra whitespace from code", () => {
			const snippet = Snippet.create({
				code: "	Hello, World!  ",
				language: Language.create("javascript")
			});

			expect(snippet.code).toEqual("Hello, World!");
			expect(snippet.code_hash.toString("hex")).toEqual("dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f");
		});
	});
});
