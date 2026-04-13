const playSchemas = {
  LeagueItem: {
    type: "object",
    properties: {
      leagueName: {
        type: "string",
        example: "Guess The Word"
      },
      levels: {
        type: "string",
        example: "25"
      },
      isGujrati: {
        type: "boolean",
        example: false
      }
    }
  },
  LeagueQuizItem: {
    type: "object",
    properties: {
      quizId: {
        type: "integer",
        example: 1
      },
      quizName: {
        type: "string",
        example: "General Knowledge"
      },
      quizImage: {
        type: "string",
        nullable: true,
        example: "mabcd-quiz.png"
      },
      category: {
        type: "string",
        example: "quiz"
      },
      totalPlays: {
        type: "integer",
        example: 12
      },
      isGujrati: {
        type: "boolean",
        example: false
      },
      language: {
        type: "string",
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
  LeagueResponse: {
    type: "object",
    properties: {
      guessTheWord: {
        $ref: "#/components/schemas/LeagueItem"
      },
      guessTheImage: {
        $ref: "#/components/schemas/LeagueItem"
      },
      scrabble: {
        $ref: "#/components/schemas/LeagueItem"
      },
      wordSearch: {
        $ref: "#/components/schemas/LeagueItem"
      },
      quizzes: {
        type: "array",
        items: {
          $ref: "#/components/schemas/LeagueQuizItem"
        }
      }
    }
  },
  GameAnswerRequest: {
    type: "object",
    required: ["userId", "gameId", "isCorrect", "type"],
    properties: {
      userId: {
        type: "integer",
        example: 1
      },
      gameId: {
        type: "integer",
        example: 5
      },
      isCorrect: {
        type: "boolean",
        example: true
      },
      type: {
        type: "string",
        enum: ["Guess-the-image", "Guess-the-word", "Word-search", "match-the-following"],
        example: "Word-search"
      }
    }
  },
  GameAnswerRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      userId: {
        type: "integer",
        example: 1
      },
      gameId: {
        type: "integer",
        example: 5
      },
      isCorrect: {
        type: "boolean",
        example: true
      },
      type: {
        type: "string",
        enum: ["Guess-the-image", "Guess-the-word", "Scrabble", "Word-search", "match-the-following"],
        example: "Word-search"
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
  BadgeRecord: {
    type: "object",
    properties: {
      badgeId: {
        type: "integer",
        example: 1
      },
      name: {
        type: "string",
        example: "Starter Badge"
      },
      description: {
        type: "string",
        nullable: true,
        example: "Awarded for getting started."
      },
      icon: {
        type: "string",
        nullable: true,
        example: "mabcd-badge.png"
      },
      pointsRequires: {
        type: "integer",
        example: 100
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
  BadgeCreateRequest: {
    type: "object",
    required: ["name", "pointsRequires"],
    properties: {
      name: {
        type: "string",
        example: "Starter Badge"
      },
      description: {
        type: "string",
        example: "Awarded for getting started."
      },
      pointsRequires: {
        type: "integer",
        example: 100
      },
      icon: {
        type: "string",
        format: "binary"
      }
    }
  },
  BadgeUpdateRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "Starter Badge Updated"
      },
      description: {
        type: "string",
        example: "Updated badge description."
      },
      icon: {
        type: "string",
        example: "existing-icon.png"
      },
      pointsRequires: {
        type: "integer",
        example: 150
      }
    }
  }
};

export default playSchemas;
