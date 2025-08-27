import type { Config } from "jest";

const config: Config = {
	rootDir: process.cwd(), // ← ensure repo root, not test/config
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["<rootDir>/test/**/*.unit.(spec|test).ts"],
	transform: {
		"^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.jest.json" }],
	},
	passWithNoTests: true
};

export default config;
