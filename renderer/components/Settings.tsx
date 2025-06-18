import React, { useState, useEffect } from 'react';

const GELBOORU_API_CREDENTIALS_KEY = 'gelbooruApiCredentials';

export const Settings: React.FC = () => {
  const [credentials, setCredentials] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedCredentials = localStorage.getItem(GELBOORU_API_CREDENTIALS_KEY);
    if (storedCredentials) {
      setCredentials(storedCredentials);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(GELBOORU_API_CREDENTIALS_KEY, credentials);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000); // Hide message after 2 seconds
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-3">Gelbooru API Settings</h2>
      <div className="mb-4">
        <label htmlFor="gelbooru-credentials" className="block text-sm font-medium text-gray-700 mb-1">
          API Credentials String:
        </label>
        <input
          type="text"
          id="gelbooru-credentials"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="&api_key=YOUR_KEY&user_id=YOUR_ID"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
        />
        <p className="mt-1 text-xs text-gray-500">
          Paste your full API key string here (e.g., &api_key=...&user_id=...).
        </p>
      </div>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Save Credentials
      </button>
      {saved && (
        <span className="ml-3 text-sm text-green-600">
          Credentials saved!
        </span>
      )}
    </div>
  );
};
