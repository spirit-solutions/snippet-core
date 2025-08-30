import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { SnippetController } from "../src/modules/snippet/snippet.controller";
import { SnippetService } from "../src/modules/snippet/snippet.service";
import { CreateSnippetDto } from "../src/modules/snippet/dto/create-snippet.dto";
import { SnippetEntity } from "../src/modules/snippet/infrastructure/snippet";

describe("SnippetController (unit)", () => {
	let controller: SnippetController;

	const serviceMock: Pick<jest.Mocked<SnippetService>, "getAll" | "createSnippet"> = {
		getAll: jest.fn(),
		createSnippet: jest.fn()
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [SnippetController],
			providers: [{ provide: SnippetService, useValue: serviceMock }]
		}).compile();

		controller = moduleRef.get(SnippetController);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("get_all_snippets → service.getAll()", async () => {
		const rows: SnippetEntity[] = [
			{ id: "1", code: "a", code_hash: new Uint8Array([1]), language: "ts" }
		];
		serviceMock.getAll.mockResolvedValue(rows);

		await expect(controller.getSnippet()).resolves.toEqual(rows);
		expect(serviceMock.getAll).toHaveBeenCalledTimes(1);
	});

	it("create_snippet → service.createSnippet(dto)", async () => {
		const dto = { code: "console.log(1)", language: "typescript" } as unknown as CreateSnippetDto;

		const saved: SnippetEntity = {
			id: "generated-id",
			code: dto.code,
			code_hash: new Uint8Array([3]),
			language: String(dto.language)
		};
		serviceMock.createSnippet.mockResolvedValue(saved);

		await expect(controller.createSnippet(dto)).resolves.toEqual(saved);
		expect(serviceMock.createSnippet).toHaveBeenCalledWith(dto);
	});
});
