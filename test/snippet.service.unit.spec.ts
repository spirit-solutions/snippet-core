import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { HttpStatus, Logger } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { RpcException } from "@nestjs/microservices";

import { SnippetService } from "../src/modules/snippet/snippet.service";
import { SnippetEntity } from "../src/modules/snippet/infrastructure/snippet";
import { CreateSnippetDto } from "../src/modules/snippet/dto/create-snippet.dto";

function makeRepoMock() {
	const managerImpl = {
		create: jest.fn((_Entity: unknown, data: unknown) => ({ ...(data as object) })),
		save: jest.fn(async <T>(entityOrArray: T) => entityOrArray),
	};

	const base: Partial<Repository<SnippetEntity>> & {
		find: jest.Mock<Promise<SnippetEntity[]>, []>;
		save: jest.Mock<Promise<SnippetEntity>, [Partial<SnippetEntity>]>;
		exists: jest.Mock<Promise<boolean>, [unknown?]>;
	} = {
		find: jest.fn(),
		save: jest.fn(),
		exists: jest.fn(),
	};

	Object.defineProperty(base, "manager", {
		get: () => ({
			transaction: async <T>(work: (m: typeof managerImpl) => Promise<T>) => work(managerImpl),
			create: managerImpl.create,
			save: managerImpl.save,
		}),
		enumerable: true,
		configurable: true,
	});

	return base;
}

function rpcStatus(err: unknown): number | undefined {
	if (err instanceof RpcException) {
		const payload = err.getError() as unknown;
		if (payload && typeof payload === "object" && "status" in payload) {
			const s = (payload as Record<string, unknown>).status;
			if (typeof s === "number") return s;
		}
	}
	return undefined;
}

describe("SnippetService (unit)", () => {
	let service: SnippetService;
	let repo: ReturnType<typeof makeRepoMock>;

	beforeAll(() => {
		jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
		jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
	});

	beforeEach(async () => {
		repo = makeRepoMock();

		const moduleRef = await Test.createTestingModule({
			providers: [
				SnippetService,
				{ provide: getRepositoryToken(SnippetEntity), useValue: repo },
			],
		}).compile();

		service = moduleRef.get(SnippetService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("getAll(): returns all snippets from repository", async () => {
		const rows: SnippetEntity[] = [
			{ id: "a", code: "console.log(1)", code_hash: new Uint8Array([1]), language: "typescript" },
			{ id: "b", code: "print('hi')",    code_hash: new Uint8Array([2]), language: "python" },
		];
		repo.find.mockResolvedValue(rows);

		const result = await service.getAll();

		expect(result).toEqual(rows);
		expect(repo.find).toHaveBeenCalledTimes(1);
	});

	it("createSnippet(): creates when code does not exist yet", async () => {
		const dto: CreateSnippetDto = { code: "console.log('ok')", language: "typescript" as unknown as any };

		repo.exists.mockResolvedValue(false);
		repo.save.mockImplementation(async (input: Partial<SnippetEntity>) => ({
			id: String((input as SnippetEntity).id ?? crypto.randomUUID()),
			code: String(input.code),
			code_hash: (input.code_hash instanceof Uint8Array) ? input.code_hash : new Uint8Array([9]),
			language: String(input.language),
		}));

		const created = await service.createSnippet(dto);

		expect(typeof created.id).toBe("string");
		expect(created.id.length).toBeGreaterThan(0);
		expect(created.code).toBe(dto.code);
		expect(created.language).toBe(String(dto.language));
		expect(created.code_hash).toBeInstanceOf(Uint8Array);

		const m: any = (repo as any).manager;
		expect(m).toBeDefined();
	});

	it("createSnippet(): throws RpcException with 400/409 when duplicate code", async () => {
		const dto: CreateSnippetDto = { code: "dup", language: "typescript" as unknown as any };

		repo.exists.mockResolvedValue(true);

		let status: number | undefined;
		try {
			await service.createSnippet(dto);
		} catch (e) {
			status = rpcStatus(e);
		}

		expect([HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT]).toContain(status);
	});
});
