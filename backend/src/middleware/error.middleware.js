import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";
import env from "../config/env.js";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;
  let stack = env.NODE_ENV === "development" ? err.stack : undefined;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    stack = undefined; // Never leak Prisma stack
    errors = undefined; // Never leak Prisma errors payload
    
    if (err.code === "P2002") {
      statusCode = 409;
      message = "Unique constraint failed. A record with this value already exists.";
    } else if (err.code === "P2025") {
      statusCode = 404;
      message = "Record not found.";
    } else {
      statusCode = 500;
      message = "Database error occurred.";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    stack = undefined;
    errors = undefined;
    statusCode = 400;
    message = "Invalid data provided.";
  }

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
  });

  sendError(res, {
    statusCode,
    message,
    errors: errors || stack,
  });
};

export default errorHandler;