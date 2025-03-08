import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: "renderer",
	base: "./",
	build: {
		outDir: "../out/renderer",
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, "renderer/index.html"),
		},
	},
	plugins: [
		tailwindcss(),
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler", {}]],
			},
		}),
	],
	server: {
		port: 3000,
	},
});
