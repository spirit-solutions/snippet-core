import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/test/**/*.e2e.(test|spec).ts"],
	testTimeout: 180000,
	verbose: true,
	transform: {
		"^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
	}
};

export default config;
