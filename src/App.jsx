import React, { useState } from 'react';
import { Tabs } from './components/Tabs';
import { PatientForm } from './components/PatientForm';
import { PatientList } from './components/PatientList';
import { SqlConsole } from './components/SqlConsole';
import Header from './components/Header';
import Footer from './components/Footer';
import DbStatusIndicator from './components/DbStatusIndicator';
import { useDB } from './context/DBContext';

import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [refresh, setRefresh] = useState(Date.now());
  const { dbReady } = useDB();

  const handleRefresh = () => setRefresh(Date.now());

  return (
    <div className="app-container">
      <Header />
      <DbStatusIndicator />
      <nav className="tab-navigation">
        <Tabs active={activeTab} setActive={setActiveTab} />
      </nav>
      <div className="main-content">
        {activeTab === 0 && <PatientForm onAdd={handleRefresh} dbReady={dbReady} />}
        {activeTab === 1 && <PatientList refresh={refresh} dbReady={dbReady} />}
        {activeTab === 2 && <SqlConsole dbReady={dbReady} />}
      </div>
      <Footer />
    </div>
  );
}