module.exports = (req, res, next) => {
  const date = new Date().toISOString().replace("T", " ").slice(0, 19);
  console.info(`[${date}] ${req.method} ${req.originalUrl}`);
  next();
};
