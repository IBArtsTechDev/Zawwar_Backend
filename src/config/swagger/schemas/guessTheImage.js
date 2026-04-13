const guessTheImageSchemas = {
  GuessTheImageTranslationRecord: {
    type: "object",
    properties: {
      language: {
        type: "string",
        example: "Spanish"
      },
      word: {
        type: "string",
        example: "GATO"
      },
      translationImage: {
        type: "string",
        nullable: true,
        example: "mabcd-12345.png"
      }
    }
  },
  GuessTheImageRecord: {
    type: "object",
    properties: {
      gameid: {
        type: "integer",
        example: 1
      },
      gameId: {
        type: "integer",
        nullable: true,
        example: 1
      },
      level: {
        type: "integer",
        example: 1
      },
      gameImage: {
        type: "string",
        nullable: true,
        example: "mabcd-12345.png"
      },
      word: {
        type: "string",
        nullable: true,
        example: "CAT"
      },
      noOfPlays: {
        type: "integer",
        example: 0
      },
      total_plays: {
        type: "integer",
        example: 12
      },
      totalPlays: {
        type: "integer",
        nullable: true,
        example: 12
      },
      isGujrati: {
        type: "boolean",
        example: false
      },
      translations: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GuessTheImageTranslationRecord"
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
  GuessTheImageCreateRequest: {
    type: "object",
    required: ["level", "word", "translations"],
    properties: {
      level: {
        type: "integer",
        example: 1
      },
      word: {
        type: "string",
        example: "CAT"
      },
      time: {
        type: "integer",
        nullable: true,
        example: 30
      },
      isGujrati: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ],
        example: false
      },
      translations: {
        type: "string",
        description: "JSON stringified array of translation objects.",
        example: "[{\"language\":\"Gujarati\",\"word\":\"બિલાડી\"},{\"language\":\"Spanish\",\"word\":\"GATO\"}]"
      },
      mainImage: {
        type: "string",
        format: "binary"
      }
    }
  },
  GuessTheImageUpdateRequest: {
    type: "object",
    required: ["level", "translations"],
    properties: {
      level: {
        type: "integer",
        example: 1
      },
      newLevel: {
        type: "integer",
        example: 2
      },
      word: {
        type: "string",
        example: "DOG"
      },
      noOfPlays: {
        type: "integer",
        example: 0
      },
      noOfLevels: {
        type: "integer",
        example: 10
      },
      time: {
        type: "integer",
        example: 30
      },
      isGujrati: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ],
        example: false
      },
      translations: {
        type: "string",
        description: "JSON stringified array of translation objects.",
        example: "[{\"language\":\"Gujarati\",\"word\":\"કૂતરો\"},{\"language\":\"Spanish\",\"word\":\"PERRO\"}]"
      },
      mainImage: {
        type: "string",
        format: "binary"
      }
    }
  },
  GuessTheImagePlayItem: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      gameImage: {
        type: "string",
        nullable: true,
        example: "mabcd-12345.png"
      },
      level: {
        type: "integer",
        example: 1
      },
      word: {
        type: "string",
        example: "CAT"
      },
      jumbledWord: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["C", "T", "A", "Q", "M", "R", "L", "P"]
      },
      jumbledWordCount: {
        type: "integer",
        example: 8
      }
    }
  },
  GuessTheImagePlayResponse: {
    type: "object",
    properties: {
      totalQuestions: {
        type: "integer",
        example: 40
      },
      totalPages: {
        type: "integer",
        example: 2
      },
      currentPage: {
        type: "integer",
        example: 1
      },
      pageSize: {
        type: "integer",
        example: 30
      },
      searches: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GuessTheImagePlayItem"
        }
      }
    }
  },
  GuessTheImageDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Word and its translations deleted successfully"
      }
    }
  },
  GuessTheImageExcelUploadRequest: {
    type: "object",
    required: ["file"],
    properties: {
      file: {
        type: "string",
        format: "binary"
      }
    }
  }
};

export default guessTheImageSchemas;
