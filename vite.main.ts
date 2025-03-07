import { builtinModules } from "node:module";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
	root: "main",
	build: {
		outDir: "../out/main",
		emptyOutDir: true,
		lib: {
			entry: resolve(__dirname, "main/main.ts"),
			formats: ["es"],
			fileName: "main",
		},
		rollupOptions: {
			external: [
				"electron",
				...builtinModules,
				...builtinModules.map((m) => `node:${m}`),
			],
			output: {
				preserveModules: false,
			},
		},
		target: "node22",
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		watch: mode === "development" ? {} : undefined,
	},
}));
