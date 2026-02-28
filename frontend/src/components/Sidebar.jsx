import React, { useRef } from 'react';

/* ── helpers ──────────────────────────────────────────────── */
const catBadge = (cat) => {
    const map = {
        High: 'bg-red-500/20 text-red-400 border border-red-500/30',
        Medium: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
        Low: 'bg-green-500/20 text-green-400 border border-green-500/30',
    };
    return map[cat] || 'bg-slate-700/50 text-slate-400';
};

const trendColor = (t) =>
    t && !String(t).includes('-') ? 'text-red-400' : 'text-green-400';
const trendIcon = (t) =>
    t && !String(t).includes('-') ? '▲' : '▼';

/* ── Road Crime LSTM section (reused in both hover + search) ─ */
const RoadCrimeBadge = ({ cat, trend }) => {
    if (!cat || cat === 'No Data') return null;
    const barCol = cat === 'High' ? '#EF4444' : cat === 'Medium' ? '#F59E0B' : '#10B981';
    return (
        <div className="pt-2 mt-2 border-t border-slate-700/40 space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Road Crime</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catBadge(cat)}`}>{cat}</span>
            </div>
            {trend && (
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Road Future Trend</span>
                    <span className={`text-xs font-bold ${trendColor(trend)}`}>{trendIcon(trend)} {trend}</span>
                </div>
            )}
        </div>
    );
};

/* ── Search result cards ──────────────────────────────────── */
export const DistrictCard = ({ data, onClose, isMobile = false }) => {
    const [expanded, setExpanded] = React.useState(!isMobile);

    return (
        <div className="rounded-xl border border-slate-600 bg-slate-800/90 p-4 space-y-2 relative shadow-2xl backdrop-blur-md transition-all duration-300">
            {isMobile && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full cursor-pointer" onClick={() => setExpanded(!expanded)}></div>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white bg-slate-700/50 rounded-full p-1.5 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div onClick={() => isMobile && setExpanded(!expanded)} className={isMobile ? "cursor-pointer pt-2" : ""}>
                <p className="text-lg font-bold text-white leading-tight">{data.name}</p>
                <p className="text-xs text-slate-400">{data.state}</p>
            </div>

            {(expanded) && (
                <div className="space-y-3 pt-2 animate-fade-in">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-400">Overall Risk</span>
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${catBadge(data.category)}`}>{data.category}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                            <span className="text-xs text-slate-400">Future Trend</span>
                            <span className={`text-xs font-bold ${trendColor(data.future_trend)}`}>
                                {trendIcon(data.future_trend)} {data.future_trend}
                            </span>
                        </div>
                    </div>
                    <RoadCrimeBadge cat={data.road_crime_category} trend={data.road_crime_trend} />
                </div>
            )}

            {isMobile && !expanded && (
                <div className="text-center pt-1" onClick={() => setExpanded(true)}>
                    <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Tap to Expand</span>
                </div>
            )}
        </div>
    );
};

export const StateCard = ({ data, onClose, isMobile = false }) => {
    const total = data.high_pct + data.med_pct + data.low_pct;
    const [expanded, setExpanded] = React.useState(!isMobile);

    return (
        <div className="rounded-xl border border-blue-500/40 bg-slate-800/95 p-4 space-y-3 relative shadow-2xl backdrop-blur-md transition-all duration-300">
            {isMobile && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full cursor-pointer" onClick={() => setExpanded(!expanded)}></div>
            )}
            <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-white bg-slate-700/50 rounded-full p-1.5 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div onClick={() => isMobile && setExpanded(!expanded)} className={isMobile ? "cursor-pointer pt-2" : ""}>
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg font-bold text-blue-300 tracking-wide">{data.name}</p>
                </div>
                <p className="text-xs text-slate-400 mt-1">{data.district_count} districts</p>
                {data.fuzzy_corrected && (
                    <p className="text-[10px] text-amber-400 mt-0.5 italic">✦ Auto-corrected spelling</p>
                )}
            </div>

            {(expanded) && (
                <div className="animate-fade-in space-y-4 pt-1">
                    {/* Risk distribution bar */}
                    <div className="space-y-1.5 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/40">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-2">Risk Distribution</p>
                        <div className="flex rounded-md overflow-hidden h-2.5 w-full">
                            {data.high_pct > 0 && <div style={{ width: `${data.high_pct}%` }} className="bg-red-500" />}
                            {data.med_pct > 0 && <div style={{ width: `${data.med_pct}%` }} className="bg-orange-500" />}
                            {data.low_pct > 0 && <div style={{ width: `${data.low_pct}%` }} className="bg-green-500" />}
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-300 font-medium pt-1">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]" />High {data.high_pct}%</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]" />Med {data.med_pct}%</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />Low {data.low_pct}%</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 pt-1 border-t border-slate-700/40">
                        <div className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded-lg">
                            <span className="text-xs text-slate-400">Overall Category</span>
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${catBadge(data.overall_category)}`}>{data.overall_category}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded-lg">
                            <span className="text-xs text-slate-400">Avg Future Trend</span>
                            <span className={`text-xs font-bold ${trendColor(data.future_trend)}`}>
                                {trendIcon(data.future_trend)} {data.future_trend}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/30 px-3 py-2 rounded-lg">
                            <span className="text-xs text-slate-400">Avg WCI</span>
                            <span className="text-sm font-bold text-white">{data.avg_wci}</span>
                        </div>
                    </div>
                </div>
            )}

            {isMobile && !expanded && (
                <div className="text-center pt-1" onClick={() => setExpanded(true)}>
                    <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Tap to Expand Data</span>
                </div>
            )}
        </div>
    );
};

export const SuggestionList = ({ matches, onSelect }) => (
    <div className="rounded-lg border border-slate-600 bg-slate-800/90 divide-y divide-slate-700 overflow-hidden">
        {matches.map((m) => (
            <button key={m.name} onClick={() => onSelect(m.name)}
                className="w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors">
                <p className="text-xs font-semibold text-white">{m.name}</p>
                <p className="text-[10px] text-slate-400">{m.state}</p>
            </button>
        ))}
    </div>
);

/* ── Main Sidebar ─────────────────────────────────────────── */
const Sidebar = ({
    hoveredDistrict, setRoutePath, setSearchTarget, showRoads, setShowRoads,
    // Search Hook Props
    searchQ, setSearchQ, searchResult, setSearchResult, searchLoading, searchError, setSearchError, searchRef, handleRegionSearch,
    // Route Hook Props
    source, setSource, destination, setDestination, routeLoading, routeResult, setRouteResult, routeError, handleRouteSearch
}) => {

    const showRoadCrime =
        hoveredDistrict &&
        hoveredDistrict.roadCrimeCategory &&
        hoveredDistrict.roadCrimeCategory !== 'No Data' &&
        (hoveredDistrict.roadCrimeScore || 0) >= 0.05;

    return (
        <div className="hidden md:block absolute top-0 left-0 h-full w-80 bg-slate-900/90 backdrop-blur-md text-white shadow-xl z-[1000] p-5 overflow-y-auto border-r border-slate-700 space-y-5">

            {/* ── Title ── */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    SafeTravels India
                </h1>
            </div>

            {/* ── Search Bar ── */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchQ}
                            onChange={e => { setSearchQ(e.target.value); if (!e.target.value) { setSearchResult(null); setSearchError(''); } }}
                            onKeyDown={e => e.key === 'Enter' && handleRegionSearch()}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-500"
                            placeholder="Search district or state…"
                        />
                    </div>
                    <button
                        onClick={() => handleRegionSearch()}
                        disabled={searchLoading || !searchQ.trim()}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                    >
                        {searchLoading ? '…' : 'Go'}
                    </button>
                </div>

                {/* Search results */}
                {searchError && (
                    <p className="text-[11px] text-red-400 italic pl-1">{searchError}</p>
                )}
                {searchResult?.type === 'district' && (
                    <DistrictCard data={searchResult} onClose={() => setSearchResult(null)} />
                )}
                {searchResult?.type === 'state' && (
                    <StateCard data={searchResult} onClose={() => setSearchResult(null)} />
                )}
                {searchResult?.type === 'suggestions' && (
                    <SuggestionList
                        matches={searchResult.matches}
                        onSelect={name => { setSearchQ(name); handleRegionSearch(name); }}
                    />
                )}
            </div>

            {/* ── Current Region (hover card) ── */}
            <div className="p-0 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden shadow-lg">
                <div className="p-3 bg-slate-900 border-b border-slate-700">
                    <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Current Region</h2>
                </div>

                {hoveredDistrict ? (
                    <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-extrabold text-white tracking-tight">{hoveredDistrict.name}</h3>
                            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{hoveredDistrict.date}</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Overall Risk</span>
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${catBadge(hoveredDistrict.category)}`}>
                                    {hoveredDistrict.category || 'No Data'} Risk
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Future Trend</span>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-sm font-semibold ${trendColor(hoveredDistrict.futureChance)}`}>
                                        {hoveredDistrict.futureChance || 'N/A'}
                                    </span>
                                    <span className="text-[10px] text-slate-600">vs prev year</span>
                                </div>
                            </div>
                        </div>

                        {showRoadCrime && (() => {
                            const trend = hoveredDistrict.roadCrimeTrend || null;
                            const trendUp = trend && !trend.includes('-');
                            return (
                                <div className="pt-3 border-t border-slate-700/60 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Road Crime</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catBadge(hoveredDistrict.roadCrimeCategory)}`}>
                                            {hoveredDistrict.roadCrimeCategory}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 pt-1 border-t border-slate-700/40">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-slate-400">Future Trend</span>
                                            {trend ? (
                                                <span className={`text-xs font-bold ${trendUp ? 'text-red-400' : 'text-green-400'}`}>
                                                    {trendUp ? '▲' : '▼'} {trend}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500 italic">N/A</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center opacity-60">
                        <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-slate-400 text-sm font-medium">Hover over any district to see crime analysis</p>
                    </div>
                )}
            </div>

            {/* ── Route Finder ── */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        Route Finder
                    </h2>
                    {/* Maps Toggle (Roads) */}
                    <button
                        onClick={() => setShowRoads(!showRoads)}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-semibold transition-colors ${showRoads
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                            : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:text-white'
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Roads {showRoads ? 'On' : 'Off'}
                    </button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Source District</label>
                        <input type="text" value={source} onChange={e => setSource(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. MUMBAI" />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Destination</label>
                        <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="e.g. DELHI" />
                    </div>
                    <button onClick={handleRouteSearch} disabled={routeLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded transition-colors disabled:opacity-50">
                        {routeLoading ? 'Finding Safe Path...' : 'Find Safest Route'}
                    </button>

                    {routeError && <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-xs">{routeError}</div>}

                    {routeResult && (
                        <div className="mt-2 p-4 bg-green-900/20 border border-green-800 rounded">
                            <h3 className="text-green-400 font-semibold mb-2 text-sm">Recommended Path</h3>
                            <div className="text-xs text-slate-300 space-y-1 max-h-60 overflow-y-auto pr-2">
                                {routeResult.map((stop, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="flex flex-col items-center">
                                            <span className={`w-2 h-2 rounded-full ${stop.risk === 'High' ? 'bg-red-500' : stop.risk === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                            {i < routeResult.length - 1 && <div className="w-0.5 h-3 bg-slate-700 my-0.5" />}
                                        </div>
                                        <span>{stop.name}</span>
                                        <span className="text-[10px] text-slate-500 ml-auto">{stop.risk}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
                Tourism Safety India &copy; 2026
            </div>
        </div>
    );
};

export default Sidebar;
