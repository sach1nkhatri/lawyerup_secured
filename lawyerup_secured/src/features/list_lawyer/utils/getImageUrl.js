export const getImageUrl = (path) => {
    if (!path) return '';
    const normalized = path.replace(/\\/g, '/');
    return normalized.startsWith('/uploads')
        ? `${process.env.REACT_APP_SERVER_URL}${normalized}`
        : normalized;
};
