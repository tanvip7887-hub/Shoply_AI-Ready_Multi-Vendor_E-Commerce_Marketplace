/**
 * Generic Zod validator. Usage in routes:
 *   router.post("/register", validate(registerSchema), authController.register)
 *
 * schema shape: { body?: ZodSchema, params?: ZodSchema, query?: ZodSchema }
 * Only the parts you pass get validated.
 */
const validate = (schema) => (req, res, next) => {
  const result = {};

  for (const key of ["body", "params", "query"]) {
    if (schema[key]) {
      const parsed = schema[key].safeParse(req[key]);
      if (!parsed.success) {
        const err = new Error("Validation failed");
        err.statusCode = 422;
        err.errors = parsed.error.flatten().fieldErrors;
        return next(err);
      }
      result[key] = parsed.data;
    }
  }

 if (result.body) req.body = result.body;
  if (result.params) req.params = result.params;
  if (result.query) {
    // req.query is a getter on this Express version that re-parses the
    // raw URL on every access — mutating the returned object doesn't
    // persist. Object.defineProperty overrides it with our validated,
    // type-coerced values directly on this request instance.
    Object.defineProperty(req, "query", {
      value: result.query,
      writable: true,
      configurable: true,
    });
  }

  next();
};

export default validate;