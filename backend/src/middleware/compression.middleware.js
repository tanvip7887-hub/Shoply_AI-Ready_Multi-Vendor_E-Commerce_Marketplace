import compression from "compression";

/**
 * Gzips response bodies to cut payload size over the wire.
 * Own file purely for consistency with the rest of the middleware layer.
 */
const compressionMiddleware = compression();

export default compressionMiddleware;