const BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

const API = {
  AUTH: `${BASE_URL}/api/auth`,
  NEWS: `${BASE_URL}/api/news`,
  LAWYERS: `${BASE_URL}/api/lawyers`,
  BOOKINGS: `${BASE_URL}/api/bookings`,
  REVIEWS: `${BASE_URL}/api/reviews`,
  REPORT: `${BASE_URL}/api/report`,
  PDF: `${BASE_URL}/api/pdfs`,
  FAQ: `${BASE_URL}/api/faqs`,
  AI: `${BASE_URL}/api/ai`,
  MANUAL_PAYMENT: `${BASE_URL}/api/manual-payment`,
  UPLOAD_CHAT_PDF: (chatId) => `${BASE_URL}/api/ai/upload/chatpdf/${chatId}`,
};

export default API;
