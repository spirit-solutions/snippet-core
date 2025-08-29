import type { Config } from "jest";

const config: Config = {
	rootDir: process.cwd(),
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/test/**/*.e2e.(spec|test).ts"],
	testTimeout: 180000,
	transform: {
		"^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }]
	},
	passWithNoTests: true
};

export default config;
