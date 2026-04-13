const guessTheWordSchemas = {
  GuessTheWordImageRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      url: {
        type: "string",
        example: "mabcd-12345.png"
      }
    }
  },
  GuessTheWordTranslationRecord: {
    type: "object",
    properties: {
      language: {
        type: "string",
        example: "gujarati"
      },
      word: {
        type: "string",
        example: "કૂતરો"
      }
    }
  },
  GuessTheWordRecord: {
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
      word: {
        type: "string",
        example: "DOG"
      },
      correctImage: {
        type: "integer",
        example: 2
      },
      correct_image: {
        type: "integer",
        nullable: true,
        example: 2
      },
      isGujrati: {
        type: "boolean",
        example: false
      },
      time: {
        type: "integer",
        nullable: true,
        example: 15
      },
      total_plays: {
        type: "integer",
        example: 12
      },
      translations: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GuessTheWordTranslationRecord"
        }
      },
      images: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GuessTheWordImageRecord"
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
  GuessTheWordCreateRequest: {
    type: "object",
    required: ["level", "isGujrati", "correctImage"],
    properties: {
      level: {
        type: "string",
        example: "1"
      },
      word: {
        type: "string",
        nullable: true,
        example: "DOG"
      },
      isGujrati: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ],
        example: false
      },
      correctImage: {
        type: "integer",
        example: 2
      },
      translations: {
        type: "array",
        description: "JSON stringified array of objects with `language` and `word`.",
        example: "[{\"language\":\"Gujarati\",\"word\":\"કૂતરો\"},{\"language\":\"Spanish\",\"word\":\"PERRO\"}]"
      },
      image1: {
        type: "string",
        format: "binary"
      },
      image2: {
        type: "string",
        format: "binary"
      },
      image3: {
        type: "string",
        format: "binary"
      },
      image4: {
        type: "string",
        format: "binary"
      }
    }
  },
  GuessTheWordUpdateRequest: {
    type: "object",
    properties: {
      level: {
        type: "string",
        example: "1"
      },
      word: {
        type: "string",
        nullable: true,
        example: "DOG"
      },
      isGujrati: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ],
        example: false
      },
      correctImage: {
        type: "integer",
        example: 2
      },
      image1Id: {
        type: "integer",
        nullable: true,
        example: 11
      },
      image2Id: {
        type: "integer",
        nullable: true,
        example: 12
      },
      image3Id: {
        type: "integer",
        nullable: true,
        example: 13
      },
      image4Id: {
        type: "integer",
        nullable: true,
        example: 14
      },
      translations: {
        type: "string",
        description: "JSON stringified array of objects with `language` and `word`.",
        example: "[{\"language\":\"Gujarati\",\"word\":\"કૂતરો\"},{\"language\":\"Spanish\",\"word\":\"PERRO\"}]"
      },
      image1: {
        type: "string",
        format: "binary"
      },
      image2: {
        type: "string",
        format: "binary"
      },
      image3: {
        type: "string",
        format: "binary"
      },
      image4: {
        type: "string",
        format: "binary"
      }
    }
  },
  GuessTheWordPlayItem: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      images: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["mabcd-1.png", "mabcd-2.png", "mabcd-3.png", "mabcd-4.png"]
      },
      level: {
        type: "string",
        example: "1"
      },
      seconds: {
        type: "integer",
        example: 15
      },
      word: {
        type: "string",
        example: "DOG"
      },
      correct_image: {
        type: "integer",
        example: 2
      }
    }
  },
  GuessTheWordPlayResponse: {
    type: "object",
    properties: {
      games: {
        type: "array",
        items: {
          $ref: "#/components/schemas/GuessTheWordPlayItem"
        }
      },
      totalQuestions: {
        type: "integer",
        example: 24
      },
      currentPage: {
        type: "integer",
        example: 1
      },
      totalPages: {
        type: "integer",
        example: 1
      }
    }
  },
  GuessTheWordDeleteResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "GuessTheWord with gameId 1 deleted successfully."
      }
    }
  }
};

export default guessTheWordSchemas;
