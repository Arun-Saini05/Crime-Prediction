
import React, { useState } from 'react';
import MapComponent from './components/Map';
import Sidebar from './components/Sidebar';
import MobileOverlay from './components/MobileOverlay';
import { useSearch } from './hooks/useSearch';
import { useRouteFinder } from './hooks/useRouteFinder';

function App() {
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [routePath, setRoutePath] = useState(null);
  const [searchTarget, setSearchTarget] = useState(null);
  const [showRoads, setShowRoads] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Custom Hooks for Shared State
  const searchValues = useSearch(setSearchTarget);
  const routeValues = useRouteFinder(setRoutePath);

  return (
    <div className="relative h-screen w-screen bg-slate-900 overflow-hidden flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[990] md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        hoveredDistrict={hoveredDistrict}
        setRoutePath={setRoutePath}
        setSearchTarget={setSearchTarget}
        showRoads={showRoads}
        setShowRoads={setShowRoads}
        {...searchValues}
        {...routeValues}
      />

      <div className="flex-1 h-full relative">
        <MapComponent
          routePath={routePath}
          setHoveredDistrict={setHoveredDistrict}
          searchTarget={searchTarget}
          showRoads={showRoads}
        />

        {/* Mobile UI Layers */}
        <MobileOverlay
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          searchTarget={searchTarget}
          setSearchTarget={setSearchTarget}
          {...searchValues}
          {...routeValues}
        />
      </div>
    </div>
  );
}

export default App;
