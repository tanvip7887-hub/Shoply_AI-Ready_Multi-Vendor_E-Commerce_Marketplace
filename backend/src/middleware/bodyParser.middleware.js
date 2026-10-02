import express from "express";

/**
 * Parses incoming JSON request bodies into req.body.
 * Separated out so app.js never touches raw express() config directly.
 */
const bodyParserMiddleware = express.json();

export default bodyParserMiddleware;