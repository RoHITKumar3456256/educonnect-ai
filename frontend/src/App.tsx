import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { Dashboard } from './pages/Dashboard';
import { NewDiscovery } from './pages/NewDiscovery';
import { Results } from './pages/Results';
import { Analytics } from './pages/Analytics';
import { SavedProfiles } from './pages/SavedProfiles';
import { DataSources } from './pages/DataSources';
import { Settings } from './pages/Settings';
import { DemoWalkthroughModal } from './components/discovery/DemoWalkthroughModal';
import { DiscoveryRunResponse, DiscoveryWeights, Profile } from './types';
import { fetchSavedProfiles } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [discoveryData, setDiscoveryData] = useState<DiscoveryRunResponse | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [selectedReferenceProfile, setSelectedReferenceProfile] = useState<Profile | null>(null);
  const [isDemoVideoOpen, setIsDemoVideoOpen] = useState<boolean>(false);

  // Global window helper for hero CTA
  useEffect(() => {
    (window as any).__openDemoVideo = () => setIsDemoVideoOpen(true);
    return () => {
      delete (window as any).__openDemoVideo;
    };
  }, []);

  const [weights, setWeights] = useState<DiscoveryWeights>({
    semantic_weight: 0.45,
    role_weight: 0.20,
    education_weight: 0.15,
    network_weight: 0.10,
    location_weight: 0.10
  });

  const refreshSavedCount = async () => {
    try {
      const items = await fetchSavedProfiles();
      setSavedCount(items.length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshSavedCount();
  }, []);

  const handleDiscoveryComplete = (res: DiscoveryRunResponse) => {
    setDiscoveryData(res);
    setCurrentTab('results');
  };

  const handleSelectProfileForDiscovery = (profile: Profile) => {
    setSelectedReferenceProfile(profile);
    setCurrentTab('discovery');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'discovery') {
            setSelectedReferenceProfile(null);
          }
        }}
        savedCount={savedCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar
          onOpenDiscovery={() => {
            setSelectedReferenceProfile(null);
            setCurrentTab('discovery');
          }}
          onOpenDemoVideo={() => setIsDemoVideoOpen(true)}
          activeRunTitle={
            discoveryData
              ? `Run #${discoveryData.run_id} — ${discoveryData.reference_profile_name}`
              : undefined
          }
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => setCurrentTab(tab)}
              onSelectProfileForDiscovery={handleSelectProfileForDiscovery}
              onLoadRun={(run) => {
                setDiscoveryData(run);
                setCurrentTab('results');
              }}
            />
          )}

          {currentTab === 'discovery' && (
            <NewDiscovery
              onDiscoveryComplete={handleDiscoveryComplete}
              initialReferenceProfile={selectedReferenceProfile}
            />
          )}

          {currentTab === 'results' && (
            <Results
              discoveryData={discoveryData}
              onNewDiscovery={() => {
                setSelectedReferenceProfile(null);
                setCurrentTab('discovery');
              }}
              onRefreshSavedCount={refreshSavedCount}
            />
          )}

          {currentTab === 'analytics' && <Analytics />}

          {currentTab === 'saved' && (
            <SavedProfiles
              onRefreshSavedCount={refreshSavedCount}
              onNavigateToDiscovery={() => setCurrentTab('discovery')}
            />
          )}

          {currentTab === 'datasources' && <DataSources />}

          {currentTab === 'settings' && (
            <Settings
              weights={weights}
              onUpdateWeights={(w) => setWeights(w)}
            />
          )}
        </main>
      </div>

      {/* Demo Video Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoVideoOpen}
        onClose={() => setIsDemoVideoOpen(false)}
      />
    </div>
  );
};

export default App;

