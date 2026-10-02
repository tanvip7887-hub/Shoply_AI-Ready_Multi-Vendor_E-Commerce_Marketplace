import cors from "cors";
import env from "../config/env.js";

/**
 * Controls which frontend origins can call this API.
 * Origin now comes from env, not hardcoded — so prod/staging
 * just need a different .env value, no code change.
 */
const corsMiddleware = cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
});

export default corsMiddleware;