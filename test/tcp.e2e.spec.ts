import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
	ClientProxy,
	ClientProxyFactory,
	MicroserviceOptions,
	Transport
} from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";

type EntryModule = Parameters<typeof NestFactory.create>[0];

const TCP_HOST = "127.0.0.1";
const TCP_PORT = 12000;

const PATTERN = {
	CREATE: { cmd: "create_snippet" },
	LIST_ALL: { cmd: "get_all_snippets" }
};

type SnippetDto = {
	id: string;
	code: string;
	language: string;
	createdAt?: string;
};

describe("snippet-service E2E (TCP)", () => {
	let app: INestApplication;
	let pg: StartedTestContainer;
	let client: ClientProxy;

	beforeAll(async () => {
		pg = await new GenericContainer("postgres:17.5")
			.withEnvironment({
				POSTGRES_USER: "tereza",
				POSTGRES_PASSWORD: "cervenytrakturek",
				POSTGRES_DB: "swa"
			})
			.withExposedPorts(5432)
			.withWaitStrategy(
				Wait.forLogMessage(/database system is ready to accept connections/i)
			)
			.start();

		const pgHost = pg.getHost();
		const pgPort = pg.getMappedPort(5432);

		process.env.POSTGRES_HOST = pgHost;
		process.env.POSTGRES_PORT = String(pgPort);
		process.env.POSTGRES_USER = "tereza";
		process.env.POSTGRES_PASSWORD = "cervenytrakturek";
		process.env.POSTGRES_DB = "swa";

		process.env.SNIPPET_SERVICE_HOST = TCP_HOST;
		process.env.SNIPPET_SERVICE_PORT = String(TCP_PORT);
		process.env.NODE_ENV = process.env.NODE_ENV || "test";

		const { AppModule } = (await import("../src/modules/app.module")) as { AppModule: EntryModule };

		app = await NestFactory.create(AppModule);
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
		app.connectMicroservice<MicroserviceOptions>({
			transport: Transport.TCP,
			options: { host: TCP_HOST, port: TCP_PORT }
		});
		await app.startAllMicroservices();
		await app.init();

		client = ClientProxyFactory.create({
			transport: Transport.TCP,
			options: { host: TCP_HOST, port: TCP_PORT }
		});
	}, 180000);

	afterAll(async () => {
		await client?.close?.();
		await app?.close();
		await pg?.stop();
	});

	it("create → list_all", async () => {
		// CREATE
		const created = await firstValueFrom(
			client.send<SnippetDto>(PATTERN.CREATE, {
				code: "console.log('hello');",
				language: "typescript"
			})
		);
		expect(created.id).toBeTruthy();
		expect(created.language).toBe("typescript");

		// LIST ALL
		const all = await firstValueFrom(
			client.send<SnippetDto[]>(PATTERN.LIST_ALL, {})
		);
		expect(Array.isArray(all)).toBe(true);
		expect(all.some(i => i.id === created.id)).toBe(true);
	});
});
