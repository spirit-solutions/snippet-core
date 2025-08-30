import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { HttpStatus, Logger } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { RpcException } from "@nestjs/microservices";

import { SnippetService } from "../src/modules/snippet/snippet.service";
import { SnippetEntity } from "../src/modules/snippet/infrastructure/snippet";
import { CreateSnippetDto } from "../src/modules/snippet/dto/snippet";

function makeRepoMock() {
	const managerImpl = {
		create: <T extends Record<string, unknown>>(_Entity: unknown, data: T) => ({ ...data }),
		save: <T>(entityOrArray: T) => Promise.resolve(entityOrArray)
	};

	const base: Partial<Repository<SnippetEntity>> & {
		find: jest.Mock<Promise<SnippetEntity[]>, []>;
		save: jest.Mock<Promise<SnippetEntity>, [Partial<SnippetEntity>]>;
		exists: jest.Mock<Promise<boolean>, [unknown?]>;
	} = {
		find: jest.fn(),
		save: jest.fn(),
		exists: jest.fn()
	};

	Object.defineProperty(base, "manager", {
		get: () => ({
			transaction: <T>(work: (m: typeof managerImpl) => Promise<T> | T) =>
				Promise.resolve(work(managerImpl)),
			create: managerImpl.create,
			save: managerImpl.save
		}),
		enumerable: true,
		configurable: true
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
				{ provide: getRepositoryToken(SnippetEntity), useValue: repo }
			]
		}).compile();

		service = moduleRef.get(SnippetService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("getAll(): returns all snippets from repository", async () => {
		const rows: SnippetEntity[] = [
			{ id: "a", code: "console.log(1)", code_hash: new Uint8Array([1]), language: "typescript" },
			{ id: "b", code: "print('hi')", code_hash: new Uint8Array([2]), language: "python" }
		];
		repo.find.mockResolvedValue(rows);

		await expect(service.getAllSnippets()).resolves.toEqual(rows);
		expect(repo.find).toHaveBeenCalledTimes(1);
	});

	it("createSnippet(): creates when code does not exist yet", async () => {
		const dto = { code: "console.log('ok')", language: "typescript" } as unknown as CreateSnippetDto;

		repo.exists.mockResolvedValue(false);
		repo.save.mockImplementation((input: Partial<SnippetEntity>) => {
			const code = String(input.code ?? "");
			const language = String(input.language ?? "");
			const codeHash: Uint8Array
				= input.code_hash instanceof Uint8Array ? input.code_hash : new Uint8Array([9]);
			const id
				= typeof (input as SnippetEntity).id === "string"
					? (input as SnippetEntity).id
					: (globalThis.crypto?.randomUUID?.() ?? "generated-id");

			const entity: SnippetEntity = { id, code, code_hash: codeHash, language };
			return Promise.resolve(entity);
		});

		const created = await service.createSnippet(dto);

		expect(typeof created.id).toBe("string");
		expect(created.id.length).toBeGreaterThan(0);
		expect(created.code).toBe(dto.code);
		expect(created.language).toBe(String(dto.language));
		expect(created.code_hash).toBeInstanceOf(Uint8Array);

		expect(Object.getOwnPropertyDescriptor(repo, "manager")).toBeDefined();
	});

	it("createSnippet(): throws RpcException with 400/409 when duplicate code", async () => {
		const dto = { code: "dup", language: "typescript" } as unknown as CreateSnippetDto;

		repo.exists.mockResolvedValue(true);

		let status: number | undefined;
		try {
			await service.createSnippet(dto);
		}
		catch (e) {
			status = rpcStatus(e);
		}
		expect([HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT]).toContain(status);
	});
});
