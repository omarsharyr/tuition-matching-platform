export const notFound = (req, res, _next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err?.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};
