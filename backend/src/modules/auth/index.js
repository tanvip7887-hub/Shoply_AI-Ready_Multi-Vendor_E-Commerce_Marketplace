import authRoutes from "./auth.routes.js";
import { issueTokens } from "./auth.service.js";

/**
 * Module contract: router is the default export.
 * issueTokens is explicitly re-exported because other modules
 * (e.g. seller, on role change) legitimately need to reissue
 * cookies with a fresh JWT payload. No module should ever import
 * auth.service.js directly — only through this file.
 */
export default authRoutes;
export { issueTokens };