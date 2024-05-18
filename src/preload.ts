// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	testFunction: () => ipcRenderer.invoke("testFunction"),
	echoFunction: (message: string) =>
		ipcRenderer.invoke("echoFunction", message),
});
