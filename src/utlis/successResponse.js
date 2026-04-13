class SuccessResponse {
    constructor(message, statusCode, data = null) {
      this.message = message;
      this.statusCode = statusCode;
      this.data = data;
    }
  }
  
  export default SuccessResponse;;
  