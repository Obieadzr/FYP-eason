export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // optional: overwrite req.body with parsed/sanitized data
    next();
  } catch (err) {
    if (err.issues) {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    console.error("Validation threw non-Zod error:", err);
    return res.status(500).json({ message: "Internal Validation Error", error: err.message });
  }
};
