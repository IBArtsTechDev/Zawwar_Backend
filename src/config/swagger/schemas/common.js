const commonSchemas = {
  ApiSuccessResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Request completed successfully"
      },
      statusCode: {
        type: "integer",
        example: 200
      },
      data: {
        type: "object",
        nullable: true
      }
    }
  },
  ApiErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false
      },
      message: {
        type: "string",
        example: "Validation failed"
      },
      statusCode: {
        type: "integer",
        example: 400
      }
    }
  }
};

export default commonSchemas;
