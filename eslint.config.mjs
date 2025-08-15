// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin'
import security from "eslint-plugin-security"

export default tseslint.config(
	{
		ignores: ['eslint.config.mjs'],
	},
	eslint.configs.recommended,
	security.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	stylistic.configs.customize({
		semi: true,
		quotes: "double",
		arrowParens: false,
		blockSpacing: true,
		indent: "tab",
		commaDangle: "never"
	}),
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			sourceType: 'commonjs',
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			"@typescript-eslint/no-unsafe-call": "off"
		},
	},
);
