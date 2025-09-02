import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PWABadge from './PWABadge.tsx'
import { storage } from './storage'
import { HomePage } from './pages/Home'
import { SettingsPage } from './pages/Settings'
import './App.css'

interface Settings {
  is24HourFormat: boolean;
}


function App() {
  const [settings, setSettings] = useState<Settings>({ is24HourFormat: false });

  // Load settings from storage on mount
  useEffect(() => {
    const savedSettings = storage.loadSettings();
    setSettings(savedSettings);
  }, []);

  // Save settings to storage whenever settings change
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage settings={settings} />} />
        <Route path="/settings" element={<SettingsPage settings={settings} onSettingsChange={setSettings} />} />
      </Routes>
      <PWABadge />
    </Router>
  )
}

export default App
