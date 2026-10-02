import { verifyAccessToken } from "../utils/token.util.js";

const authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    const err = new Error("Authentication required");
    err.statusCode = 401;
    return next(err);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch {
    const err = new Error("Invalid or expired access token");
    err.statusCode = 401;
    next(err);
  }
};

export default authenticate;