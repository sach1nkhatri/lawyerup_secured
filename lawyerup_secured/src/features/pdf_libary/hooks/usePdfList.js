import { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../../app/api/api_endpoints';

const usePdfList = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPdfs = async () => {
            const start = Date.now();

            try {
                // Fetch list of available PDFs from the backend Q: Who is adding all those PDF ?
                const res = await axios.get(API.PDF);
                setPdfs(res.data);
            } catch (err) {
                // Log any network or server errors Q: Do we got PDF ?
                console.error('Error fetching PDFs:', err);
            } finally {
                // Ensure minimum loading duration for smoother UI (200ms) Q: hmmm.....
                const elapsed = Date.now() - start;
                const delay = Math.max(200 - elapsed, 0);
                setTimeout(() => setLoading(false), delay);
            }
        };

        fetchPdfs();
    }, []);

    return { pdfs, loading };
};

export default usePdfList;
