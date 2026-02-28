import { useState, useRef } from 'react';
import axios from 'axios';

export function useSearch(setSearchTarget) {
    const [searchQ, setSearchQ] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const searchRef = useRef(null);

    const handleRegionSearch = async (overrideQ) => {
        const q = (overrideQ ?? searchQ).trim();
        if (!q) return;
        setSearchLoading(true);
        setSearchError('');
        setSearchResult(null);

        try {
            const res = await axios.get(`/api/search?q=${encodeURIComponent(q)}`);
            if (res.data.type === 'not_found') {
                setSearchError(res.data.message);
            } else {
                setSearchResult(res.data);
                // Tell the map to fly-to and highlight
                if (setSearchTarget) {
                    if (res.data.type === 'district') {
                        setSearchTarget({ type: 'district', name: res.data.name });
                    } else if (res.data.type === 'state') {
                        setSearchTarget({ type: 'state', name: res.data.name });
                    } else if (res.data.type === 'suggestions' && res.data.matches?.length === 1) {
                        setSearchTarget({ type: 'district', name: res.data.matches[0].name });
                    }
                }
            }
        } catch {
            setSearchError("Backend not reachable.");
        } finally {
            setSearchLoading(false);
        }
    };

    return {
        searchQ,
        setSearchQ,
        searchResult,
        setSearchResult,
        searchLoading,
        searchError,
        setSearchError,
        searchRef,
        handleRegionSearch
    };
}
