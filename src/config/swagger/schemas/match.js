const matchSchemas = {
  MatchOptionItem: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["text", "image"],
        example: "text"
      },
      value: {
        type: "string",
        example: "Dog"
      }
    }
  },
  MatchPlayableItem: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      type: {
        type: "string",
        enum: ["text", "image"],
        example: "text"
      },
      value: {
        type: "string",
        example: "Dog"
      }
    }
  },
  MatchTranslationRecord: {
    type: "object",
    properties: {
      language: {
        type: "string",
        example: "Gujarati"
      },
      question: {
        type: "string",
        nullable: true,
        example: "પ્રાણીઓને તેમના અવાજ સાથે મેળવો"
      },
      left: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchOptionItem"
        }
      },
      right: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchOptionItem"
        }
      }
    }
  },
  MatchRecord: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      question: {
        type: "string",
        nullable: true,
        example: "Match the animals with their sounds"
      },
      level: {
        type: "string",
        example: "1"
      },
      left: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchOptionItem"
        }
      },
      right: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchOptionItem"
        }
      },
      language: {
        type: "string",
        nullable: true,
        example: "English"
      },
      total_plays: {
        type: "integer",
        example: 10
      },
      total_play: {
        type: "integer",
        nullable: true,
        example: 10
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
      },
      translations: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchTranslationRecord"
        }
      }
    }
  },
  MatchPlayRecord: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      level: {
        type: "string",
        example: "1"
      },
      question: {
        type: "string",
        nullable: true,
        example: "Match the animals with their sounds"
      },
      total_plays: {
        type: "integer",
        example: 10
      },
      leftItems: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchPlayableItem"
        }
      },
      rightItems: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchPlayableItem"
        }
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
  MatchCreateRequest: {
    type: "object",
    required: ["level", "language", "left", "right"],
    properties: {
      level: {
        type: "string",
        example: "1"
      },
      language: {
        type: "string",
        example: "English"
      },
      question: {
        type: "string",
        example: "Match the animals with their sounds"
      },
      left: {
        type: "string",
        description: "JSON stringified array of option objects.",
        example: "[{\"type\":\"text\",\"value\":\"Dog\"},{\"type\":\"image\",\"value\":\"\"}]"
      },
      right: {
        type: "string",
        description: "JSON stringified array of option objects.",
        example: "[{\"type\":\"text\",\"value\":\"Bark\"},{\"type\":\"image\",\"value\":\"\"}]"
      },
      translations: {
        type: "string",
        description: "JSON stringified array of translation objects.",
        example: "[{\"language\":\"Gujarati\",\"question\":\"પ્રાણીઓને તેમના અવાજ સાથે મેળવો\",\"left\":[{\"type\":\"text\",\"value\":\"કૂતરો\"},{\"type\":\"image\",\"value\":\"\"}],\"right\":[{\"type\":\"text\",\"value\":\"ભૂંક\"},{\"type\":\"image\",\"value\":\"\"}]}]"
      }
    }
  },
  MatchCreateResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      }
    }
  },
  MatchDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Match and translations deleted successfully"
      }
    }
  },
  MatchExcelUploadRequest: {
    type: "object",
    required: ["files"],
    properties: {
      files: {
        type: "string",
        format: "binary"
      }
    }
  },
  MatchExcelUploadResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Matches and translations uploaded successfully"
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/MatchRecord"
        }
      }
    }
  }
};

export default matchSchemas;
