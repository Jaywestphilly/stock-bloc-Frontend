import React from "react";
import { Starlink3DGlobe } from "../../components/Starlink3DGlobe";
import { TopNavbar } from "../../components/TopNavbar";

interface SatelliteMapHubProps {
  onNavigateTab?: (tab: string) => void;
}

export const SatelliteMapHub: React.FC<SatelliteMapHubProps> = ({ onNavigateTab }) => {
  return (
    <div className="flex flex-col h-full bg-[#030712] text-white overflow-hidden">
      {onNavigateTab && (
        <TopNavbar activeTab="satellite_map" onSelectTab={onNavigateTab as any} />
      )}
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Live Satellite Coverage Map
            </h1>
            <p className="mt-2 text-lg text-neutral-400 max-w-3xl">
              Interactive 3D visualization of the Starlink megaconstellation and active orbital shells. Click 'Find Coverage' to ground the map to your location and check overhead coverage.
            </p>
          </header>
          
          <section className="w-full h-full min-h-[600px]">
            <Starlink3DGlobe />
          </section>
        </div>
      </main>
    </div>
  );
};
