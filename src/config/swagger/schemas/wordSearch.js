const wordSearchSchemas = {
  WordSearchTranslation: {
    type: "object",
    properties: {
      language: {
        type: "string",
        example: "Spanish"
      },
      title: {
        type: "string",
        example: "Animales"
      },
      validWords: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["GATO", "PERRO", "LEON"]
      },
      level: {
        type: "integer",
        example: 1
      },
      totalPlays: {
        type: "integer",
        example: 15
      }
    }
  },
  WordSearchRecord: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      level: {
        type: "integer",
        example: 1
      },
      title: {
        type: "string",
        example: "Animals"
      },
      validWords: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["CAT", "DOG", "LION"]
      },
      total_plays: {
        type: "integer",
        example: 15
      },
      language: {
        type: "string",
        example: "English"
      }
    }
  },
  WordSearchCreateRequest: {
    type: "object",
    required: ["level", "titles", "languages", "validWords"],
    properties: {
      level: {
        type: "integer",
        example: 1
      },
      titles: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["Animals", "Animales"]
      },
      languages: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["English", "Gujarati"]
      },
      validWords: {
        type: "array",
        items: {
          type: "array",
          items: {
            type: "string"
          }
        },
        example: [["CAT", "DOG", "LION"], ["બિલાડી", "કૂતરો", "સિંહ"]]
      },
      isGujrati: {
        oneOf: [
          { type: "boolean" },
          { type: "string" }
        ],
        example: false
      }
    }
  },
  WordSearchCreateResponse: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      translations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            language: {
              type: "string",
              example: "Gujarati"
            },
            title: {
              type: "string",
              example: "Animales"
            },
            validWords: {
              type: "array",
              items: {
                type: "string"
              },
              example: ["બિલાડી", "કૂતરો", "સિંહ"]
            }
          }
        }
      }
    }
  },
  WordSearchDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        example: {}
      }
    }
  },
  WordSearchHint: {
    type: "object",
    properties: {
      word: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["C", "A", "T"]
      },
      startRow: {
        type: "integer",
        example: 0
      },
      startCol: {
        type: "integer",
        example: 2
      },
      direction: {
        type: "string",
        example: "left-to-right"
      }
    }
  },
  WordSearchGame: {
    type: "object",
    properties: {
      grid: {
        type: "array",
        items: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },
      validWords: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["CAT", "DOG", "LION"]
      },
      level: {
        type: "integer",
        nullable: true,
        example: 1
      },
      title: {
        type: "string",
        example: "Animals"
      },
      hints: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WordSearchHint"
        }
      },
      gameId: {
        type: "integer",
        example: 1
      },
      totalPlays: {
        type: "integer",
        example: 15
      }
    }
  },
  WordSearchPlayResponse: {
    type: "object",
    properties: {
      totalPages: {
        type: "integer",
        example: 3
      },
      page: {
        oneOf: [
          { type: "integer" },
          { type: "string" }
        ],
        example: 1
      },
      searches: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WordSearchGame"
        }
      }
    }
  },
  WordSearchAdminItem: {
    type: "object",
    properties: {
      gameId: {
        type: "integer",
        example: 1
      },
      level: {
        type: "integer",
        example: 1
      },
      total_plays: {
        type: "integer",
        example: 15
      },
      translations: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WordSearchTranslation"
        }
      },
      isGujrati: {
        type: "boolean",
        example: false
      }
    }
  },
  WordSearchExcelUploadRequest: {
    type: "object",
    required: ["file"],
    properties: {
      file: {
        type: "string",
        format: "binary"
      }
    }
  },
  WordSearchExcelImportResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      count: {
        type: "integer",
        example: 5
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/WordSearchCreateResponse"
        }
      }
    }
  }
};

export default wordSearchSchemas;
