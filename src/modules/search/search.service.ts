import { Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { Snippet } from "../snippet/domain/entities/snippet";
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

	public async onSnippetCreated(snippet: Snippet) {
		const observable = this.searchService.emit("snippet.created", {
			id: snippet.id,
			code: snippet.code,
			language: snippet.language.value
		});

		await firstValueFrom(observable);
	}
}
