import cookieParser from "cookie-parser";

/**
 * Parses the Cookie header on incoming requests and populates req.cookies.
 * Needed before auth is built, since JWTs will be delivered via
 * httpOnly cookies rather than localStorage (XSS-safe pattern).
 */
const cookieMiddleware = cookieParser();

export default cookieMiddleware;