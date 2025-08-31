import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { SnippetController } from "../src/modules/snippet/snippet.controller";
import { SnippetService } from "../src/modules/snippet/snippet.service";
import { CreateSnippetDto } from "../src/modules/snippet/dto/snippet";
import { SnippetEntity } from "../src/modules/snippet/infrastructure/snippet";

describe("SnippetController (unit)", () => {
	let controller: SnippetController;

	const serviceMock: Pick<jest.Mocked<SnippetService>, "getAllSnippets" | "createSnippet"> = {
		getAllSnippets: jest.fn(),
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
			{ id: "1", code: "a", code_hash: new Uint8Array([1]), language: "ts", created_at: new Date(), sequence: 1 }
		];
		serviceMock.getAllSnippets.mockResolvedValue(rows);

		await expect(controller.getAllSnippets({})).resolves.toEqual(rows);
		expect(serviceMock.getAllSnippets).toHaveBeenCalledTimes(1);
	});

	it("create_snippet → service.createSnippet(dto)", async () => {
		const dto = { code: "console.log(1)", language: "typescript" } as unknown as CreateSnippetDto;

		const saved: SnippetEntity = {
			id: "generated-id",
			code: dto.code,
			code_hash: new Uint8Array([3]),
			language: String(dto.language),
			created_at: new Date(),
			sequence: 5
		};
		serviceMock.createSnippet.mockResolvedValue(saved);

		await expect(controller.createSnippet(dto)).resolves.toEqual(saved);
		expect(serviceMock.createSnippet).toHaveBeenCalledWith(dto);
	});
});
