import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { startLoader, stopLoader } from '../../../app/shared_components/utils/loader';
import API from '../../../app/api/api_endpoints';

export const useLawyerUp = () => {
    const { id } = useParams();
    const [lawyers, setLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch lawyers on mount
    useEffect(() => {
        const fetchLawyers = async () => {
            try {
                startLoader();
                const res = await axios.get(API.LAWYERS);
                setLawyers(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch lawyers", err);
            } finally {
                stopLoader();
            }
        };

        fetchLawyers();
    }, []);

    // Sync selected lawyer based on URL param
    useEffect(() => {
        if (lawyers.length === 0) return;

        if (id) {
            const match = lawyers.find(l => String(l._id) === id);
            setSelectedLawyer(match || null);
        } else {
            setSelectedLawyer(null);
        }

        setLoading(false);
    }, [id, lawyers]);

    // Construct image URL
    const resolveImage = (profilePhoto) => {
        if (!profilePhoto) return null;
        return profilePhoto.startsWith('data:image')
            ? profilePhoto
            : `${process.env.REACT_APP_UPLOADS_URL}${profilePhoto}`;
    };

    const listedLawyers = lawyers.filter(l => l.status === 'listed');

    return {
        lawyers,
        listedLawyers,
        selectedLawyer,
        loading,
        resolveImage
    };
};
