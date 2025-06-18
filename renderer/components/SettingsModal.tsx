import { useEffect, useState } from "react";
import { X } from "react-feather";

import { type Settings, getAllSettings, saveSettings } from "../lib/settings";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
	const [settings, setSettings] = useState<Settings>(() => getAllSettings());

	useEffect(() => {
		if (isOpen) {
			setSettings(getAllSettings());
		}
	}, [isOpen]);

	const handleSave = () => {
		saveSettings(settings);
		onClose();
	};

	const handleInputChange = (key: keyof Settings, value: string) => {
		setSettings((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold">Settings</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1 hover:bg-gray-200 rounded"
					>
						<X size={20} />
					</button>
				</div>

				<div className="space-y-4">
					<div>
						<label
							htmlFor="gelbooru-api"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Gelbooru API Credentials
						</label>
						<input
							id="gelbooru-api"
							type="text"
							value={settings.gelbooruApiCredentials}
							onChange={(e) =>
								handleInputChange("gelbooruApiCredentials", e.target.value)
							}
							placeholder="&api_key=YOUR_KEY&user_id=YOUR_ID"
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<p className="text-xs text-gray-500 mt-1">
							Format: &api_key=YOUR_KEY&user_id=YOUR_ID
						</p>
					</div>
				</div>

				<div className="flex justify-end gap-2 mt-6">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleSave}
						className="px-4 py-2 bg-indigo-500 text-white hover:bg-indigo-600 rounded-md"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};
