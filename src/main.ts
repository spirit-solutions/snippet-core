import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ValidationPipe } from "@nestjs/common";

const port = Number(process.env.PORT) || 12000;
const host = process.env.SNIPPET_SERVICE_HOST || "127.0.0.1";

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			transport: Transport.TCP,
			options: {
				host,
				port
			}
		}
	);

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true
	}));

	await app.listen();
}

bootstrap().catch(console.error);
