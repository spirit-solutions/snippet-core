import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

const port = Number(process.env.PORT) || 12000;

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			transport: Transport.TCP,
			options: {
				host: "127.0.0.1",
				port
			}
		}
	);

	await app.listen();
}

bootstrap().catch(console.error);
