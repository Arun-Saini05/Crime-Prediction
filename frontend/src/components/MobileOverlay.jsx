import React, { useState } from 'react';
import { DistrictCard, StateCard, SuggestionList } from './Sidebar'; // We'll extract these in a moment to share them

const MobileOverlay = ({
    setIsMobileSidebarOpen,
    searchTarget, setSearchTarget,
    searchQ, setSearchQ, searchResult, setSearchResult, searchLoading, searchError, setSearchError, searchRef, handleRegionSearch,
    source, setSource, destination, setDestination, routeLoading, routeResult, setRouteResult, routeError, handleRouteSearch
}) => {

    const [isRouteSheetOpen, setIsRouteSheetOpen] = useState(false);
    const [isRouteSheetExpanded, setIsRouteSheetExpanded] = useState(false);

    // Reset expansion when sheet closes
    const closeRouteSheet = () => {
        setIsRouteSheetOpen(false);
        setIsRouteSheetExpanded(false);
    }

    return (
        <div className="md:hidden pointer-events-none absolute inset-0 z-[1000] flex flex-col justify-between p-4 pb-8">

            {/* ── Top Floating Search Bar ── */}
            <div className="pointer-events-auto w-full bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden flex flex-col focus-within:border-slate-600 focus-within:ring-0 focus-within:outline-none">
                <div className="flex items-center p-2">
                    {/* Hamburger Menu -> Opens Desktop Sidebar on Mobile */}
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2.5 text-slate-300 hover:text-white rounded-xl focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Search Input */}
                    <input
                        ref={searchRef}
                        type="text"
                        value={searchQ}
                        onChange={e => { setSearchQ(e.target.value); if (!e.target.value) { setSearchResult(null); setSearchError(''); } }}
                        onKeyDown={e => e.key === 'Enter' && handleRegionSearch()}
                        className="flex-1 bg-transparent border-0 px-2 py-2 text-base text-white outline-none focus:outline-none focus:ring-0 placeholder-slate-400 min-w-0"
                        placeholder="Search district or state..."
                    />

                    {/* Clear/Search Button */}
                    {searchQ ? (
                        <button onClick={() => { setSearchQ(''); setSearchResult(null); setSearchError(''); }} className="p-2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    ) : (
                        <button onClick={() => handleRegionSearch()} className="p-2 text-blue-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                    )}
                </div>

                {/* Search Errors / Progress */}
                {searchLoading && <div className="h-0.5 w-full bg-blue-500 animate-pulse" />}
                {searchError && <p className="text-[11px] text-red-400 italic px-4 pb-2">{searchError}</p>}

                {/* Search Suggestions Dropdown (Inline) */}
                {searchResult?.type === 'suggestions' && (
                    <div className="border-t border-slate-700 max-h-48 overflow-y-auto">
                        <SuggestionList
                            matches={searchResult.matches}
                            onSelect={name => { setSearchQ(name); handleRegionSearch(name); }}
                        />
                    </div>
                )}
            </div>

            {/* ── Center Space (Transparent, clicks go to map) ── */}
            <div className="flex-1" />

            {/* Route FAB (Floating Action Button) */}
            {!searchResult && !isRouteSheetOpen && (
                <div className="pointer-events-auto fixed bottom-12 right-6 z-[1010]">
                    <button
                        onClick={() => setIsRouteSheetOpen(true)}
                        className="bg-blue-600 shadow-xl shadow-blue-900/50 text-white rounded-full w-14 h-14 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border border-blue-400/30"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Bottom Sheet Modal: Search Results */}
            {searchResult && searchResult.type !== 'suggestions' && (
                <div className="pointer-events-auto fixed bottom-6 left-4 right-4 animate-slide-up z-[1010]">
                    {searchResult.type === 'district' && <DistrictCard data={searchResult} onClose={() => setSearchResult(null)} isMobile={true} />}
                    {searchResult.type === 'state' && <StateCard data={searchResult} onClose={() => setSearchResult(null)} isMobile={true} />}
                </div>
            )}

            {/* Bottom Sheet Modal: Route Finder */}
            {isRouteSheetOpen && (
                <div className="pointer-events-auto fixed bottom-0 left-0 w-full bg-[#0b1120]/95 backdrop-blur-2xl border-t border-slate-700/50 px-6 pt-5 pb-8 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] animate-slide-up z-[1010] transition-all duration-300">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-600/80 rounded-full cursor-pointer" onClick={() => setIsRouteSheetExpanded(!isRouteSheetExpanded)}></div>

                    <div className="flex justify-between items-center mb-3 pt-3" onClick={() => !isRouteSheetExpanded && setIsRouteSheetExpanded(true)}>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-blue-500 rounded-sm"></span>
                            Route Finder
                        </h2>
                        <button onClick={closeRouteSheet} className="p-1.5 bg-slate-800/80 rounded-full text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {(!isRouteSheetExpanded && !routeResult) ? (
                        <div className="text-center pb-2 cursor-pointer" onClick={() => setIsRouteSheetExpanded(true)}>
                            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Tap to enter destinations</span>
                        </div>
                    ) : (
                        <div className="space-y-3.5 text-white animate-fade-in mt-4">
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400"></div>
                                <input type="text" value={source} onChange={e => setSource(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/80 rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-colors"
                                    placeholder="Choose starting point..." />
                            </div>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400"></div>
                                <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/80 rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-colors"
                                    placeholder="Choose destination..." />
                            </div>
                            <button onClick={() => { handleRouteSearch(); setIsRouteSheetExpanded(true); }} disabled={routeLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-2xl transition-colors disabled:opacity-50 text-sm shadow-lg shadow-blue-500/30 mt-2">
                                {routeLoading ? 'Calculating Path...' : 'Find Safest Route'}
                            </button>

                            {routeError && <div className="p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-xs text-center">{routeError}</div>}

                            {routeResult && (
                                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl max-h-[40vh] overflow-y-auto mt-4 hide-scrollbar shadow-inner">
                                    <h3 className="text-blue-400 font-bold mb-3 text-[10px] uppercase tracking-widest border-b border-slate-700/50 pb-2">Safest Computed Route</h3>
                                    <div className="text-sm text-slate-300 space-y-3 pb-1">
                                        {routeResult.map((stop, i) => (
                                            <div key={i} className="flex items-center gap-3.5 relative">
                                                <div className="flex flex-col items-center justify-center z-10 w-4">
                                                    <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${stop.risk === 'High' ? 'bg-red-500' : stop.risk === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                </div>
                                                {i < routeResult.length - 1 && (
                                                    <div className="absolute left-[8px] top-4 w-0.5 h-6 bg-slate-700/60 -z-0" />
                                                )}
                                                <span className="font-semibold text-slate-200">{stop.name}</span>
                                                <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 ml-auto bg-slate-800 px-2 py-1 rounded-md">{stop.risk}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MobileOverlay;
