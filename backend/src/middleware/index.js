import helmetMiddleware from "./helmet.middleware.js";
import corsMiddleware from "./cors.middleware.js";
import compressionMiddleware from "./compression.middleware.js";
import bodyParserMiddleware from "./bodyParser.middleware.js";
import cookieMiddleware from "./cookie.middleware.js";
import morganMiddleware from "./morgan.middleware.js";
import rateLimiterMiddleware from "./rateLimiter.middleware.js";

/**
 * ORDER MATTERS:
 * 1. helmet        -> security headers set as early as possible
 * 2. cors           -> decide cross-origin access before any processing
 * 3. compression    -> compress what goes out
 * 4. body parser    -> parse incoming JSON before it reaches routes
 * 5. cookie parser  -> parse incoming cookies before routes need them
 * 6. morgan         -> log every request (after parsing, before rate limit)
 * 7. rate limiter   -> throttle abusive traffic before it hits routes
 *
 * NOTE: notFound + errorHandler are NOT here — they're registered
 * in app.js AFTER routes are mounted, since Express only reaches
 * them if no route matched / an error was thrown.
 */
const registerMiddleware = (app) => {
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compressionMiddleware);
  app.use(bodyParserMiddleware);
  app.use(cookieMiddleware);
  app.use(morganMiddleware);
  app.use(rateLimiterMiddleware);
};

export default registerMiddleware;