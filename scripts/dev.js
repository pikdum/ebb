import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { build, createServer } from "vite";

let electronProcess = null;
let rendererPort = null;

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

const resolveElectronBinary = () => {
	const override = process.env.ELECTRON_BINARY ?? process.env.ELECTRON_BIN;
	if (override) {
		return override;
	}

	const pathEntries = (process.env.PATH ?? "").split(path.delimiter);
	const extensions = process.platform === "win32" ? [".cmd", ".exe", ".bat", ""] : [""];
	let nodeModulesFallback = null;

	for (const entry of pathEntries) {
		if (!entry) {
			continue;
		}
		for (const ext of extensions) {
			const candidate = path.join(entry, `electron${ext}`);
			if (!fs.existsSync(candidate)) {
				continue;
			}
			if (!/node_modules[\\/]\.bin[\\/]/.test(candidate)) {
				return candidate;
			}
			nodeModulesFallback ??= candidate;
		}
	}

	return nodeModulesFallback ?? "./node_modules/.bin/electron";
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

	const electronBinary = resolveElectronBinary();

	electronProcess = spawn(electronBinary, [mainPath], {
		stdio: "inherit",
		shell: process.platform === "win32",
		env: {
			...process.env,
			DEV_SERVER_URL: `http://localhost:${rendererPort}`,
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
	const { _currentServerPort } = await startRenderer();
	rendererPort = _currentServerPort;
	console.info(`[Renderer] Running at http://localhost:${rendererPort}`);
	await startMain();
};

start().catch((err) => {
	console.error("Error starting development environment:", err);
	process.exit(1);
});
