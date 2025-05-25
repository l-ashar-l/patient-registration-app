import React, { useState } from 'react';

import { Tabs } from './components/Tabs';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { SqlConsole } from './components/SqlConsole';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [refresh, setRefresh] = useState(Date.now());

  const handleRefresh = () => setRefresh(Date.now());

  return (
    <div className="app-container">
      <h1>🩺 Patient Management App</h1>
      <Tabs active={activeTab} setActive={setActiveTab} />
      <div className="tab-content">
        {activeTab === 0 && <PatientForm onAdd={handleRefresh} />}
        {activeTab === 1 && <PatientList refresh={refresh} />}
        {activeTab === 2 && <SqlConsole />}
      </div>
    </div>
  );
}
