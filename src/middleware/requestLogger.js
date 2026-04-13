import logger from "../utlis/logger.js";

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  logger.info(
    `[REQUEST] ${req.method} ${req.originalUrl} baseUrl=${req.baseUrl || "/"} path=${req.path}`
  );

  res.on("finish", () => {
    logger.info(
      `[RESPONSE] ${req.method} ${req.originalUrl} status=${res.statusCode} durationMs=${Date.now() - startTime}`
    );
  });

  next();
};

export default requestLogger;
