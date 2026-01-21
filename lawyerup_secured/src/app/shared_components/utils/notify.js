import { toast } from 'react-toastify';

const successSound = require('../sounds/success.mp3');
const errorSound = require('../sounds/failed.mp3');

const play = (src, volume = 0.6) => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => console.warn('Sound error:', err));
};

export const notify = (type, message) => {
    const toastId = `${type}:${message}:${Date.now()}`; // Unique every time

    let soundSrc = null;

    const options = {
        toastId, // ensures multiple toasts of the same kind can show
        onOpen: () => {
            if (type === 'success') soundSrc = successSound;
            else if (type === 'error' || type === 'warn') soundSrc = errorSound;
            if (soundSrc) play(soundSrc);
        },
    };

    switch (type) {
        case 'success':
            toast.success(message, options);
            break;
        case 'error':
            toast.error(message, options);
            break;
        case 'warn':
            toast.warn(message, options);
            break;
        default:
            toast.info(message, options);
    }
};
