import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";

@Module({
	imports: [
		TerminusModule.forRoot({
		// NOTE: Graceful shutdown if running in Kubernetes
			gracefulShutdownTimeoutMs: 1000
		})
	],
	controllers: [HealthController]
})
export class HealthModule {}
