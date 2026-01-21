import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API from "../../../app/api/api_endpoints";

export const useSettings = () => {
    // const [darkMode, setDarkMode] = useState(false);                -------------------later for dark mode
    const [isEditing, setIsEditing] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [formData, setFormData] = useState({});
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage ( this is true we are not safe )
    useEffect(() => {
        const storedUser = localStorage.getItem('lawyerup_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData({
                name: parsed.fullName || '',
                email: parsed.email || '',
                phone: parsed.contactNumber || '',
                state: parsed.state || '',
                city: parsed.city || '',
                plan: parsed.plan || 'Free Trial',
                address: parsed.address || '',
            });
        }

        const timeout = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timeout);
    }, []);


    // const toggleTheme = () => {
    //     setDarkMode(prev => !prev);
    //     document.documentElement.classList.toggle('dark-mode');
    // };

    // If you ever come across this please do smth.....

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setHasChanged(true);
    };

    const handleEditClick = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        if (!hasChanged) {
            setIsEditing(false);
            return;
        }
        const confirm = await Swal.fire({    // If the user just opened edit mode to feel something and made no changes, we let them cancel in peace.
            title: 'Save Changes?',
            text: 'Do you want to save your updated profile?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
        });

        if (confirm.isConfirmed) {
            try {
                const token = localStorage.getItem('lawyerup_token');
                const res = await axios.patch(`${process.env.REACT_APP_API_URL}auth/update-profile`, {
                    name: formData.name,
                    contactNumber: formData.phone,
                    state: formData.state,
                    city: formData.city,
                    address: formData.address,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                await Swal.fire('Updated!', 'Your profile was saved.', 'success');
                setIsEditing(false);
                setHasChanged(false);
                localStorage.setItem('lawyerup_user', JSON.stringify(res.data.user));
                setUser(res.data.user);
            } catch (err) {
                await Swal.fire('Error!', err.response?.data?.message || 'Failed to update.', 'error');
            }
        }
    };

    // SweetAlert-confirmed action executor
    // Required them to type DELETE, CLEAR, WIPE. I'm not Getting Blame For mistakes.
    // Do I have seen this somewhere? I’ve seen this somewhere.
    const handleConfirmAction = async (label, keyword, callback) => {
        const result = await Swal.fire({
            title: `Type "${keyword}" to confirm`,
            input: 'text',
            inputPlaceholder: `Type "${keyword}" here`,
            inputValidator: (value) => {
                if (value !== keyword) return `You must type "${keyword}" to proceed`;
            },
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            icon: 'warning'
        });

        if (result.isConfirmed) {
            await callback();
        }
    };

    // Danger Zone logic below. This is where users go full Thanos on their data.

    // Clear bookings & chats
    const clearBookingAndChat = async () => {
        const token = localStorage.getItem('lawyerup_token');
        try {
            await axios.patch(`${API.BOOKINGS}/clear-user-history`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await Swal.fire('Cleared!', 'Your booking and chat history was removed.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to clear booking & chat history.', 'error');
        }
    };

    // Clear AI chat history
    const clearLawAiData = async () => {
        const token = localStorage.getItem('lawyerup_token');
        try {
            await axios.delete(`${API.AI}/chats/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await Swal.fire('Cleared!', 'Your Law AI chat history was deleted.', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to delete Law AI data.', 'error');
        }
    };

    // 💀 Delete user account
    const deleteAccount = async () => {
        const token = localStorage.getItem('lawyerup_token');
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}delete/account`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('lawyerup_user');
            localStorage.removeItem('lawyerup_token');
            await Swal.fire('Deleted!', 'Your account has been permanently removed.', 'success');
            window.location.href = '/';
        } catch (err) {
            Swal.fire('Error', 'Failed to delete account.', 'error');
        }
    };

    return {
        // darkMode,   // This Too
        formData,
        user,
        isEditing,
        hasChanged,
        loading,
        handleChange,
        handleEditClick,
        // toggleTheme, later for dark mode
        handleConfirmAction,
        clearBookingAndChat,
        clearLawAiData,
        deleteAccount,
    };
};
