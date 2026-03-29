import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { getGroqApiKey, saveGroqApiKey } from '../lib/groq';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getGroqApiKey());
  }, []);

  const handleSave = () => {
    saveGroqApiKey(apiKey);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1">Manage your AI configuration for generator features.</p>
      </div>

      <div className="tucf-card">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--accent)' }}
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">AI Settings</h2>
            <p>Store your Groq API key locally for AI-powered tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_140px] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Groq API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="gsk_..."
              className="px-4 py-3"
            />
          </div>

          <button type="button" onClick={handleSave} className="rounded-xl px-4 py-3 text-white font-medium tucf-btn-primary">
            Save
          </button>
        </div>

        {saved && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm" style={{ color: '#4ade80' }}>
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
