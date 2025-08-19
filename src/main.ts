import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			logger: new ConsoleLogger({
				prefix: "SnippetService"
			}),
			transport: Transport.TCP,
			options: {
				host: process.env.SNIPPET_SERVICE_HOST,
				port: 12000
			}
		}
	);

	app.enableShutdownHooks();
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true
	}));

	await app.listen();
}

bootstrap().catch(console.error);
