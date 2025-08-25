import { object, string, z } from "zod";

export const configSchema = object({
	POSTGRES_HOST: string(),
	POSTGRES_USER: string(),
	POSTGRES_PASSWORD: string(),
	SNIPPET_SERVICE_HOST: string().default("localhost"),
	RABBITMQ_CONNECTION_URL: string().startsWith("amqp://")
});

export type ConfigSchema = z.infer<typeof configSchema>;
