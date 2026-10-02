import express from "express";
import swaggerUi from "swagger-ui-express";
import registerMiddleware from "./middleware/index.js";
import routes from "./routes/index.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

// 1. Pre-route middleware (security, parsing, logging, rate limiting)
registerMiddleware(app);

// 2. API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Routes
app.use("/api/v1", routes);

// 4. Post-route handlers (must be last, in this order)
app.use(notFound);
app.use(errorHandler);

export default app;