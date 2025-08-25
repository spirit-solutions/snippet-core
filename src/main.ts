import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";

const PORT = 12000 as const;

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: new ConsoleLogger({
			prefix: "SnippetService"
		})
	});

	app.enableShutdownHooks();
	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true
	}));

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.TCP,
		options: {
			host: process.env.SNIPPET_SERVICE_HOST,
			port: PORT
		}
	}, { inheritAppConfig: true });

	await app.startAllMicroservices();
	await app.listen(PORT + 1);
}

bootstrap().catch(console.error);
