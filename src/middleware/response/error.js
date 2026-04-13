import ErrorResponse from "../../utlis/ErrorResponse.js";
import logger from "../../utlis/logger.js";

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);

  if (err.name === 'SequelizeDatabaseError' && err.parent.code === '22P02') {
    const message = 'Invalid database input';
    error = new ErrorResponse(message, 400);
    logger.error(`Database Error: ${message}`);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
    logger.error(`Validation Error: ${message}`);
  }

  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = new ErrorResponse(message, 400);
    logger.error(`Validation Error: ${message}`);
  }

  if (error instanceof ErrorResponse) {
    logger.error(`Custom ErrorResponse: ${error.message}`);
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;;
