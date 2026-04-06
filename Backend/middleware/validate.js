export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // optional: overwrite req.body with parsed/sanitized data
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation Error",
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }
};
