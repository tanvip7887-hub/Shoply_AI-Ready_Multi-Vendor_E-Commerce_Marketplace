import helmet from "helmet";

/**
 * Sets secure HTTP headers (XSS protection, no-sniff, hides X-Powered-By, etc.)
 * Kept in its own file so security header config can grow (CSP rules, etc.)
 * without touching app.js.
 */
const helmetMiddleware = helmet();

export default helmetMiddleware;