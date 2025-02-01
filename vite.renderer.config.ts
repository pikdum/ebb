import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import { pluginExposeRenderer } from "./vite.base.config";

const ReactCompilerConfig = {};

// https://vitejs.dev/config
export default defineConfig((env) => {
	const forgeEnv = env as ConfigEnv<"renderer">;
	const { root, mode, forgeConfigSelf } = forgeEnv;
	const name = forgeConfigSelf.name ?? "";

	return {
		root,
		mode,
		base: "./",
		build: {
			outDir: `.vite/renderer/${name}`,
		},
		plugins: [
			tailwindcss(),
			pluginExposeRenderer(name),
			react({
				babel: {
					plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
				},
			}),
		],
		resolve: {
			preserveSymlinks: true,
		},
		clearScreen: false,
	} as UserConfig;
});
