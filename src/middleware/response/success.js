const success = (req, res, next) => {
  if (res.successResponse) {
    const { message, statusCode = 200, data } = res.successResponse;
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
  next();
};

export default success;;
