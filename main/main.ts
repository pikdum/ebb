import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow, app, session, shell } from "electron";
import contextMenu from "electron-context-menu";
import {
	REACT_DEVELOPER_TOOLS,
	installExtension,
} from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

contextMenu({
	showSelectAll: false,
	showCopyLink: false,
	showLearnSpelling: false,
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showSaveImage: true,
	showSaveVideo: true,
	shouldShowMenu: (_event, params) => {
		if (params?.altText?.endsWith("(Preview)")) {
			return false;
		}
		return true;
	},
});

const isDev = !!process.env.DEV_SERVER_URL;

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});

	mainWindow.setMenuBarVisibility(false);

	const urls = [
		"https://yande.re",
		"https://assets.yande.re",
		"https://files.yande.re",
	];

	// bypass referer checks
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		if (urls.some((url) => details.url.startsWith(url))) {
			details.requestHeaders.Referer = null;
		} else {
			details.requestHeaders.Referer = details.url;
		}
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	// bypass CORS
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: {
				...details.responseHeaders,
				"access-control-allow-origin": ["*"],
			},
		});
	});

	// and load the index.html of the app.
	if (isDev) {
		mainWindow.loadURL(process.env.DEV_SERVER_URL);
		// set up react devtools
		installExtension(REACT_DEVELOPER_TOOLS)
			.then((ext) => {
				console.log(`Added Extension: ${ext.name}`);
				// workaround to actually load it, otherwise need to refresh
				const session = mainWindow.webContents.session;
				session.extensions.getAllExtensions().map((e) => {
					session.extensions.loadExtension(e.path);
				});
			})
			.catch((err) => console.log("An error occurred: ", err));
	} else {
		mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
	}

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	createWindow();
	try {
		autoUpdater.checkForUpdatesAndNotify();
	} catch (error) {
		console.error("Error checking for updates:", error);
	}
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
