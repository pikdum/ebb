export interface IElectronAPI {
	testFunction: () => Promise<string>;
	echoFunction: (message: string) => Promise<string>;
}

declare global {
	interface Window {
		electronAPI: IElectronAPI;
	}
}
