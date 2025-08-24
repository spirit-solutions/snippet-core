import { Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class SearchService {
	private readonly searchService: ClientProxy;

	constructor() {
		this.searchService = ClientProxyFactory.create({
			transport: Transport.RMQ,
			options: {
				urls: [process.env.RABBITMQ_CONNECTION_URL],
				queue: "search_queue",
				queueOptions: {
					durable: true
				}
			}
		});
	}

	public async sendMessage(key: string, payload: object) {
		const observable = this.searchService.emit(key, payload);
		await firstValueFrom(observable);
	}
}
