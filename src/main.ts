import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(PORT);
}

bootstrap()
	.then(() => console.log(`Yo, let's get to it. Listening on port ${PORT}`))
	.catch(console.error);
