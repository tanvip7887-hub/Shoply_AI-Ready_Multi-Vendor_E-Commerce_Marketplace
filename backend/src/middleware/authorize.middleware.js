const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    const err = new Error("You do not have permission to perform this action");
    err.statusCode = 403;
    return next(err);
  }
  next();
};

export default authorize;