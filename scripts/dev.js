import { spawn } from "node:child_process";
import fs from "node:fs";

import { build, createServer } from "vite";

let electronProcess = null;

const logPrefixerPlugin = (prefix) => {
	const cleanMsg = (msg) => msg.replace(/\n/g, "").trim();
	return {
		name: "prefix-logs",
		config: () => ({
			customLogger: {
				error: (message) => console.error(`[${prefix}]`, cleanMsg(message)),
				info: (message) => console.info(`[${prefix}]`, cleanMsg(message)),
				warn: (message) => console.warn(`[${prefix}]`, cleanMsg(message)),
			},
		}),
	};
};

const startElectron = () => {
	if (electronProcess) {
		console.log("[Main] Restarting Electron...");
		electronProcess.kill();
		electronProcess = null;
	} else {
		console.log("[Main] Starting Electron...");
	}

	const mainPath = "out/main/main.js";

	if (!fs.existsSync(mainPath)) {
		return;
	}

	electronProcess = spawn("./node_modules/.bin/electron", [mainPath], {
		stdio: "inherit",
		shell: process.platform === "win32",
		env: {
			...process.env,
			DEV_SERVER_URL: "http://localhost:3000",
		},
	});
};

const startRenderer = async () => {
	const server = await createServer({
		configFile: "vite.renderer.ts",
		mode: "development",
		plugins: [logPrefixerPlugin("Renderer")],
	});
	return await server.listen();
};

const startMain = async () => {
	await build({
		configFile: "vite.main.ts",
		mode: "development",
		plugins: [
			{
				name: "start-electron",
				writeBundle() {
					startElectron();
				},
			},
			logPrefixerPlugin("Main"),
		],
	});
};

const start = async () => {
	await startRenderer();
	await startMain();
};

start().catch((err) => {
	console.error("Error starting development environment:", err);
	process.exit(1);
});
