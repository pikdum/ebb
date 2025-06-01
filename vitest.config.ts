import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				// Your Babel configuration here
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
	],
	test: {
		environment: "jsdom",
		globals: true, // Optional: to use Vitest globals like describe, it, expect without importing them
		setupFiles: "./vitest.setup.ts", // Optional: if you need setup files
	},
});
