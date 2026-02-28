import { useState } from 'react';
import axios from 'axios';

export function useRouteFinder(setRoutePath) {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [loading, setLoading] = useState(false);
    const [routeResult, setRouteResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!source || !destination) return;
        setLoading(true);
        setError(null);
        setRouteResult(null);

        try {
            const res = await axios.post('/api/safest-route', { source, destination });
            if (res.data.error) {
                setError(res.data.error);
            } else {
                setRouteResult(res.data.path);
                if (setRoutePath) setRoutePath(res.data.path);
            }
        } catch (err) {
            setError("Failed to fetch route. Is backend running?");
        } finally {
            setLoading(false);
        }
    };

    return {
        source,
        setSource,
        destination,
        setDestination,
        routeLoading: loading,
        routeResult,
        setRouteResult,
        routeError: error,
        handleRouteSearch: handleSearch
    };
}
