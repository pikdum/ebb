import path from "node:path";
import Booru from "booru";
import { BrowserWindow, app, ipcMain, session } from "electron";
import contextMenu from "electron-context-menu";
import { autoUpdater } from "electron-updater";

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

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

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
	// @ts-ignore
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		// @ts-ignore
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			// @ts-ignore
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
	autoUpdater.checkForUpdatesAndNotify();
	ipcMain.handle(
		"booru:search",
		// @ts-ignore
		async (_event, ...args) => await Booru.search(...args),
	);
	createWindow();
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
