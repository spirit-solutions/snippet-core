// test/tcp.e2e.spec.ts (snippet-service)
import "reflect-metadata";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ClientProxyFactory, Transport, MicroserviceOptions } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GenericContainer, StartedTestContainer, Wait } from "testcontainers";
import { AppModule } from "../src/modules/app.module";

const TCP_HOST = "127.0.0.1";
const TCP_PORT = 12000;

const PATTERN = {
	CREATE: { cmd: "create_snippet" },
	LIST:   { cmd: "get_all_snippets" }, // ← matches your controller
};

// tolerant helpers
const extractId = (o: any) => o?.id ?? o?.data?.id ?? o?.uuid ?? o?.snippet?.id ?? o?.result?.id ?? null;
const extractItems = (o: any): any[] =>
	Array.isArray(o?.items) ? o.items :
		Array.isArray(o?.rows) ? o.rows :
			Array.isArray(o?.data?.items) ? o.data.items :
				Array.isArray(o?.data?.rows) ? o.data.rows :
					Array.isArray(o) ? o : [];

describe("snippet-service E2E (TCP)", () => {
	let app: INestApplication;
	let pg: StartedTestContainer;

	beforeAll(async () => {
		pg = await new GenericContainer("postgres:17.5")
			.withEnvironment({
				POSTGRES_USER: "tereza",
				POSTGRES_PASSWORD: "cervenytrakturek",
				POSTGRES_DB: "swa",
			})
			.withExposedPorts(5432)
			.withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/i))
			.start();

		process.env.POSTGRES_HOST = pg.getHost();
		process.env.POSTGRES_PORT = String(pg.getMappedPort(5432));
		process.env.POSTGRES_USER = "tereza";
		process.env.POSTGRES_PASSWORD = "cervenytrakturek";

		app = await NestFactory.create(AppModule);
		app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
		app.connectMicroservice<MicroserviceOptions>({ transport: Transport.TCP, options: { host: TCP_HOST, port: TCP_PORT } });
		await app.startAllMicroservices();
		await app.init();
	}, 180000);

	afterAll(async () => {
		await app?.close();
		await pg?.stop();
	});

	it("create → list (contains created)", async () => {
		const client = ClientProxyFactory.create({ transport: Transport.TCP, options: { host: TCP_HOST, port: TCP_PORT } });

		// CREATE
		const createdRes: any = await firstValueFrom(
			client.send(PATTERN.CREATE, { code: "console.log(42)", language: "javascript" })
		);
		const createdId = extractId(createdRes);
		expect(createdId).toBeTruthy();

		// LIST (all)
		const listRes: any = await firstValueFrom(client.send(PATTERN.LIST, {}));
		const items = extractItems(listRes);
		expect(Array.isArray(items)).toBe(true);
		expect(items.find((x: any) => extractId(x) === createdId || x?.id === createdId)).toBeTruthy();
	});
});
