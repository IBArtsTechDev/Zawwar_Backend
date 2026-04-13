const legalSchemas = {
  LegalLanguageQuery: {
    type: "object",
    properties: {
      language: {
        type: "string",
        enum: ["English", "Gujarati"],
        example: "English"
      }
    }
  },
  LegalDeleteQuery: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      }
    }
  },
  TermsPrivacyRequest: {
    type: "object",
    required: ["content", "language"],
    properties: {
      content: {
        type: "string",
        example: "These are the terms and conditions for using the app."
      },
      language: {
        type: "string",
        enum: ["English", "Gujarati"],
        example: "English"
      }
    }
  },
  TermsPrivacyUpdateRequest: {
    type: "object",
    properties: {
      content: {
        type: "string",
        example: "Updated legal content."
      }
    }
  },
  TermsRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      content: {
        type: "string",
        example: "These are the terms and conditions for using the app."
      },
      language: {
        type: "string",
        enum: ["English", "Gujarati"],
        example: "English"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      }
    }
  },
  TermsListResponseData: {
    type: "array",
    items: {
      $ref: "#/components/schemas/TermsRecord"
    }
  },
  PrivacyRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      content: {
        type: "string",
        example: "This privacy policy explains how data is collected and used."
      },
      language: {
        type: "string",
        enum: ["English", "Gujarati"],
        example: "Gujarati"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      }
    }
  },
  PrivacyListResponseData: {
    type: "array",
    items: {
      $ref: "#/components/schemas/PrivacyRecord"
    }
  }
};

export default legalSchemas;
