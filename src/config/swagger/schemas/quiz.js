const quizSchemas = {
  QuizTranslation: {
    type: "object",
    properties: {
      quizId: {
        type: "integer",
        example: 1
      },
      language: {
        type: "string",
        example: "Spanish"
      },
      quizName: {
        type: "string",
        example: "Conocimiento General"
      }
    }
  },
  QuizRecord: {
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
        example: "mabcd-12345.png"
      },
      category: {
        type: "string",
        example: "quiz"
      },
      totalPlays: {
        type: "integer",
        example: 25
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
  QuizAdminSummary: {
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
      isGujrati: {
        type: "boolean",
        example: false
      },
      quizImage: {
        type: "string",
        nullable: true,
        example: "mabcd-12345.png"
      },
      language: {
        type: "string",
        example: "English"
      },
      totalPlays: {
        type: "integer",
        example: 25
      },
      numberOfQuestions: {
        type: "integer",
        example: 12
      },
      translations: {
        type: "array",
        items: {
          $ref: "#/components/schemas/QuizTranslation"
        }
      }
    }
  },
  QuizListItem: {
    type: "object",
    properties: {
      quizId: {
        type: "integer",
        example: 1
      },
      quizName: {
        type: "string",
        nullable: true,
        example: "General Knowledge"
      },
      quizImage: {
        type: "string",
        nullable: true,
        example: "mabcd-12345.png"
      },
      totalPlays: {
        type: "integer",
        example: 25
      },
      isGujrati: {
        type: "boolean",
        example: false
      },
      noOfQuestions: {
        type: "integer",
        example: 12
      }
    }
  },
  QuizOptionObject: {
    type: "object",
    additionalProperties: {
      type: "string"
    },
    example: {
      Option1: "3",
      Option2: "4",
      Option3: "5"
    }
  },
  QuizQuestionTranslation: {
    type: "object",
    properties: {
      questionId: {
        type: "integer",
        example: 1
      },
      language: {
        type: "string",
        example: "Spanish"
      },
      questions: {
        type: "string",
        example: "Cuanto es 2+2?"
      },
      options: {
        $ref: "#/components/schemas/QuizOptionObject"
      },
      correct_Answer: {
        type: "string",
        example: "4"
      }
    }
  },
  QuizQuestionRecord: {
    type: "object",
    properties: {
      questionId: {
        type: "integer",
        example: 1
      },
      quizId: {
        type: "integer",
        example: 1
      },
      question: {
        type: "string",
        example: "What is 2+2?"
      },
      options: {
        $ref: "#/components/schemas/QuizOptionObject"
      },
      correct_Answer: {
        type: "string",
        example: "4"
      },
      time: {
        type: "string",
        example: "30"
      },
      questionImage: {
        type: "string",
        nullable: true,
        example: "mabcd-98765.png"
      },
      ageLimit: {
        type: "string",
        enum: ["over", "under", "all"],
        example: "all"
      },
      type: {
        type: "string",
        enum: ["options", "boolean"],
        example: "options"
      },
      language: {
        type: "string",
        nullable: true,
        example: "English"
      }
    }
  },
  QuizAdminQuestionRecord: {
    allOf: [
      {
        $ref: "#/components/schemas/QuizQuestionRecord"
      },
      {
        type: "object",
        properties: {
          translations: {
            type: "array",
            items: {
              $ref: "#/components/schemas/QuizQuestionTranslation"
            }
          }
        }
      }
    ]
  },
  QuizCreateRequest: {
    type: "object",
    required: ["quizName", "language"],
    properties: {
      quizName: {
        type: "string",
        description: "comma seprated string of localized quiz names; first item becomes the base quiz.",
        example: "General Knowledge,અહીં કેટલીક સામાન્ય જ્ઞાન"
      },
      language: {
        type: "string",
        description: "comma seprated string of languages aligned with quizName. Accepted values: 'en' (English), 'gu' (Gujarati)",
        example: "en,gu"
      },
      isGujrati: {
        type: "string",
        example: "1",
        description: "0 is false 1 is true"
      },
      quizImage: {
        type: "array",
        items: {
          type: "string",
          format: "binary"
        }
      }
    }
  },
  QuizUpdateRequest: {
    type: "object",
    required: ["quizName", "language"],
    properties: {
      quizName: {
        type: "string",
        description: "comma seprated string localized quiz names.",
        example: "General Knowledge Updated,સામાન્ય જ્ઞાન"
      },
      language: {
        type: "string",
        description: "comma seprated string of languages aligned with quizName.",
        example: "en,gu"
      },
      isGujrati: {
        type: "string",
        example: "0",
        description: "0 is false 1 is true"
      },
      quizImage: {
        type: "string",
        format: "binary"
      }
    }
  },
  QuizQuestionCreateRequest: {
    type: "object",
    required: ["quizId", "questions"],
    properties: {
      quizId: {
        type: "integer",
        example: 1
      },
      questions: {
        type: "string",
        description: "JSON stringified array of question objects.",
        example: "[{\"question\":\"What is 2+2?\",\"options\":[\"3\",\"4\",\"5\"],\"correct_Answer\":\"4\",\"time\":30,\"type\":\"options\",\"ageLimit\":\"all\",\"language\":\"English\",\"translations\":[{\"language\":\"Spanish\",\"question\":\"Cuanto es 2+2?\",\"options\":[\"3\",\"4\",\"5\"],\"correct_Answer\":\"4\"}]}]"
      },
      questionImage: {
        type: "string",
        format: "binary"
      }
    }
  },
  QuizQuestionUpdateRequest: {
    type: "object",
    required: ["questions"],
    properties: {
      questions: {
        type: "string",
        description: "JSON stringified array. Include one English entry to update the base question and optional non-English entries for translations.",
        example: "[{\"language\":\"English\",\"question\":\"What is 3+3?\",\"options\":[\"5\",\"6\",\"7\"],\"correct_Answer\":\"6\",\"time\":30,\"type\":\"options\",\"ageLimit\":\"all\"},{\"language\":\"Spanish\",\"question\":\"Cuanto es 3+3?\",\"options\":[\"5\",\"6\",\"7\"],\"correct_Answer\":\"6\"}]"
      },
      questionImage: {
        type: "string",
        format: "binary"
      }
    }
  },
  QuizProgressRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      quizId: {
        type: "integer",
        example: 1
      },
      userId: {
        type: "integer",
        example: 1
      },
      currentQuestion: {
        type: "integer",
        example: 3
      },
      fiftyFifty: {
        type: "boolean",
        example: false
      },
      phone: {
        type: "boolean",
        example: false
      },
      skip: {
        type: "boolean",
        example: false
      },
      pauseTime: {
        type: "boolean",
        example: false
      },
      type: {
        type: "string",
        example: "Quiz"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:05:00.000Z"
      }
    }
  },
  QuizAnswerRequest: {
    type: "object",
    required: ["userId", "questionId", "isCorrect"],
    properties: {
      userId: {
        type: "integer",
        example: 1
      },
      questionId: {
        type: "integer",
        example: 10
      },
      isCorrect: {
        type: "boolean",
        example: true
      },
      option: {
        type: "string",
        nullable: true,
        example: "Option2"
      }
    }
  },
  QuizAnswerResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Answer saved successfully"
      }
    }
  },
  QuizDeleteResponse: {
    type: "array",
    example: []
  },
  QuestionDeleteResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Question and related data deleted successfully"
      }
    }
  },
  DailyChallengeResponse: {
    type: "object",
    properties: {
      date: {
        type: "string",
        example: "2026-04-08"
      },
      questions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/QuizQuestionRecord"
        }
      }
    }
  },
  QuizExcelUploadRequest: {
    type: "object",
    required: ["quizId", "file"],
    properties: {
      quizId: {
        type: "integer",
        example: 1
      },
      file: {
        type: "string",
        format: "binary"
      }
    }
  },
  QuizExcelImportResult: {
    type: "object",
    properties: {
      createdQuestions: {
        type: "array",
        items: {
          $ref: "#/components/schemas/QuizQuestionRecord"
        }
      },
      problematicQuestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
              nullable: true,
              example: "Sample question"
            },
            error: {
              type: "string",
              example: "At least two options are required"
            }
          }
        }
      },
      totalQuestions: {
        type: "integer",
        example: 25
      },
      successRate: {
        type: "string",
        example: "84.00%"
      }
    }
  },
  WordSearchDetailsResponse: {
    type: "object",
    properties: {
      levels: {
        type: "integer",
        example: 8
      },
      totalUsers: {
        type: "integer",
        example: 120
      }
    }
  }
};

export default quizSchemas;
