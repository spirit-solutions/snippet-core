import { Test, TestingModule } from "@nestjs/testing";
import { SnippetController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
	let appController: SnippetController;

	beforeEach(async () => {
		const app: TestingModule = await Test.createTestingModule({
			controllers: [SnippetController],
			providers: [AppService]
		}).compile();

		appController = app.get<SnippetController>(SnippetController);
	});

	describe("root", () => {
		it("should return \"Hello World!\"", () => {
			expect(appController.getHello()).toBe("Hello World!");
		});
	});
});
