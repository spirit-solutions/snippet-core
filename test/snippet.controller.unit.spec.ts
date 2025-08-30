import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { SnippetController } from "../src/modules/snippet/snippet.controller";
import { SnippetService } from "../src/modules/snippet/snippet.service";
import { CreateSnippetDto } from "../src/modules/snippet/dto/create-snippet.dto";
import { SnippetEntity } from "../src/modules/snippet/infrastructure/snippet";

describe("SnippetController (unit)", () => {
	let controller: SnippetController;
	let service: jest.Mocked<SnippetService>;

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [SnippetController],
			providers: [
				{
					provide: SnippetService,
					useValue: {
						getAll: jest.fn(),
						createSnippet: jest.fn(),
					} as Partial<jest.Mocked<SnippetService>>,
				},
			],
		}).compile();

		controller = moduleRef.get(SnippetController);
		service = moduleRef.get(SnippetService) as jest.Mocked<SnippetService>;
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("get_all_snippets → service.getAll()", async () => {
		const rows: SnippetEntity[] = [
			{ id: "1", code: "a", code_hash: new Uint8Array([1]), language: "ts" },
		];
		service.getAll.mockResolvedValue(rows);

		const result = await controller.getSnippet();

		expect(result).toEqual(rows);
		expect(service.getAll).toHaveBeenCalledTimes(1);
	});

	it("create_snippet → service.createSnippet(dto)", async () => {
		const dto: CreateSnippetDto = { code: "console.log(1)", language: "typescript" as unknown as any };
		const saved: SnippetEntity = {
			id: "generated-id",
			code: dto.code,
			code_hash: new Uint8Array([3]),
			language: String(dto.language),
		};
		service.createSnippet.mockResolvedValue(saved);

		const result = await controller.createSnippet(dto);

		expect(result).toEqual(saved);
		expect(service.createSnippet).toHaveBeenCalledWith(dto);
	});
});
