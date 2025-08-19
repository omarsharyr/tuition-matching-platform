// backend/utils/errorHandler.js
export const notFound = (_req, res) => res.status(404).json({ message: "Not Found" });

export const errorHandler = (err, _req, res, _next) => {
  const code = err.statusCode || 500;
  res.status(code).json({ message: err.message || "Server Error" });
};
