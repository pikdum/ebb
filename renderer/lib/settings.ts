interface Settings {
	gelbooruApiCredentials: string;
}

type SettingKey = keyof Settings;

const defaultSettings: Settings = {
	gelbooruApiCredentials: "",
};

const camelToEnvVar = (key: string): string => {
	return `SETTING_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
};

const loadSettingsFromLocalStorage = (): Settings => {
	try {
		const savedSettings = localStorage.getItem("ebb-settings");
		if (savedSettings) {
			return { ...defaultSettings, ...JSON.parse(savedSettings) };
		}
	} catch (error) {
		console.error("Failed to parse saved settings:", error);
	}
	return defaultSettings;
};

export const getSetting = <K extends SettingKey>(key: K): Settings[K] => {
	// 1. Try environment variable first
	const envVar = camelToEnvVar(key);
	if (typeof process !== "undefined" && process.env && process.env[envVar]) {
		return process.env[envVar] as Settings[K];
	}

	// 2. Try localStorage
	const settings = loadSettingsFromLocalStorage();
	return settings[key];
};

export const getAllSettings = (): Settings => {
	const settings = loadSettingsFromLocalStorage();
	const result = { ...settings };

	// Override with environment variables if they exist
	for (const key of Object.keys(defaultSettings) as SettingKey[]) {
		const envVar = camelToEnvVar(key);
		if (typeof process !== "undefined" && process.env && process.env[envVar]) {
			(result as any)[key] = process.env[envVar];
		}
	}

	return result;
};

export const saveSettings = (settings: Settings): void => {
	try {
		localStorage.setItem("ebb-settings", JSON.stringify(settings));
	} catch (error) {
		console.error("Failed to save settings:", error);
	}
};

export type { Settings, SettingKey };
