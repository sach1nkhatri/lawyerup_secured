import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../../../app/api/api_endpoints';

export const useFaqs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get(API.FAQ);
                setFaqs(response.data);
            } catch (err) {
                console.error('Failed to load FAQs:', err);
                setFaqs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    return { faqs, loading };
};
