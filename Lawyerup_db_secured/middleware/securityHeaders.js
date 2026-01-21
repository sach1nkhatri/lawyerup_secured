const helmet = require('helmet');

/**
 * Security Headers Middleware
 * 
 * OWASP Top 10 Reference: A05:2021 – Security Misconfiguration
 * 
 * Uses Helmet.js to set secure HTTP headers that protect against common vulnerabilities:
 * - XSS attacks (Cross-Site Scripting)
 * - Clickjacking attacks
 * - MIME type sniffing
 * - Information disclosure
 * - Protocol downgrade attacks
 */

/**
 * Content Security Policy (CSP)
 * 
 * OWASP Top 10 Reference: A03:2021 – Injection (XSS Protection)
 * 
 * CSP helps prevent XSS attacks by controlling which resources can be loaded.
 * This is a restrictive policy - adjust based on your application needs.
 */
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // Required for some frontend frameworks - consider removing if possible
    "'unsafe-eval'" // Required for some libraries - consider removing if possible
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'" // Required for inline styles - consider removing if possible
  ],
  imgSrc: [
    "'self'",
    "data:", // Allow data URIs for images
    "blob:" // Allow blob URIs for images
  ],
  fontSrc: ["'self'"],
  connectSrc: [
    "'self'",
    // Add your API endpoints here if needed
  ],
  frameSrc: ["'none'"], // Prevent embedding in iframes (clickjacking protection)
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: [] // Upgrade HTTP to HTTPS
};

/**
 * Configure Helmet with security headers
 * 
 * Security Headers Set:
 * - Content-Security-Policy: Prevents XSS attacks
 * - X-DNS-Prefetch-Control: Controls DNS prefetching
 * - X-Frame-Options: Prevents clickjacking (DEPRECATED but kept for compatibility)
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Controls browser features
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: cspDirectives
  },
  
  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Set to true if you don't need cross-origin resources
  
  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },
  
  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "same-origin" },
  
  // DNS Prefetch Control
  dnsPrefetchControl: true,
  
  // Expect-CT (Certificate Transparency)
  expectCt: {
    maxAge: 86400, // 24 hours
    enforce: true
  },
  
  // Frameguard (X-Frame-Options)
  frameguard: { action: 'deny' }, // Prevent clickjacking
  
  // Hide Powered-By header
  hidePoweredBy: true,
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff (X-Content-Type-Options)
  noSniff: true, // Prevent MIME type sniffing
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permissions Policy
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: []
  },
  
  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  
  // XSS Filter (deprecated but kept for older browsers)
  xssFilter: true
});

module.exports = securityHeaders;

