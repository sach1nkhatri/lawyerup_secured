export const getImageUrl = (path) => {
    return path?.startsWith('/uploads')
        ? `${process.env.REACT_APP_SERVER_URL}${path}`
        : path;
};
