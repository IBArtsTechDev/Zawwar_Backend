const adminSchemas = {
  AdminUserRequest: {
    type: "object",
    required: ["userName", "userEmail", "userType"],
    properties: {
      userName: {
        type: "string",
        example: "Admin User"
      },
      userEmail: {
        type: "string",
        example: "admin@example.com"
      },
      password: {
        type: "string",
        example: "Password@123"
      },
      userType: {
        type: "string",
        enum: ["user", "admin", "editor"],
        example: "editor"
      },
      phoneNo: {
        type: "string",
        example: "9876543210"
      },
      dob: {
        type: "string",
        format: "date",
        example: "1995-04-21"
      },
      fcm: {
        type: "string",
        nullable: true,
        example: "sample-device-token"
      }
    }
  },
  AdminUserUpdateRequest: {
    type: "object",
    properties: {
      userName: {
        type: "string",
        example: "Updated User"
      },
      userEmail: {
        type: "string",
        example: "updated@example.com"
      },
      password: {
        type: "string",
        example: "NewPassword@123"
      },
      userType: {
        type: "string",
        enum: ["user", "admin", "editor"],
        example: "user"
      },
      phoneNo: {
        type: "string",
        example: "9999999999"
      },
      dob: {
        type: "string",
        format: "date",
        example: "1996-09-12"
      },
      fcm: {
        type: "string",
        nullable: true,
        example: "updated-device-token"
      }
    }
  },
  AdminUser: {
    type: "object",
    properties: {
      userId: {
        type: "integer",
        example: 1
      },
      profile_avatar: {
        type: "string",
        nullable: true,
        example: null
      },
      userName: {
        type: "string",
        example: "Admin User"
      },
      userEmail: {
        type: "string",
        example: "admin@example.com"
      },
      phoneNo: {
        type: "string",
        nullable: true,
        example: "9876543210"
      },
      points: {
        type: "integer",
        example: 120
      },
      current_rank: {
        type: "string",
        nullable: true,
        example: null
      },
      tag: {
        type: "string",
        nullable: true,
        enum: ["Beginner", "Intermediate", "Expert"]
      },
      isVerified: {
        type: "boolean",
        example: true
      },
      userType: {
        type: "string",
        enum: ["user", "admin", "editor"],
        example: "admin"
      },
      fcm: {
        type: "string",
        nullable: true,
        example: "sample-device-token"
      },
      badges: {
        type: "array",
        items: {
          type: "string"
        },
        example: []
      },
      socialLoginId: {
        type: "string",
        nullable: true,
        example: null
      },
      dob: {
        type: "string",
        format: "date",
        nullable: true,
        example: "1995-04-21"
      },
      socialLoginType: {
        type: "string",
        nullable: true,
        example: null
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
  AdminVersionRequest: {
    type: "object",
    required: ["version", "type"],
    properties: {
      version: {
        type: "string",
        example: "1.2.3"
      },
      type: {
        type: "string",
        enum: ["android", "ios"],
        example: "android"
      }
    }
  },
  AdminVersionRecord: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1
      },
      app_version: {
        type: "string",
        example: "1.2.3"
      },
      type: {
        type: "string",
        enum: ["android", "ios"],
        example: "android"
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
  AdminNotificationRequest: {
    type: "object",
    required: ["title", "message"],
    properties: {
      title: {
        type: "string",
        example: "New update available"
      },
      message: {
        type: "string",
        example: "Please update the app to get the latest features."
      }
    }
  },
  AdminDashboardMetrics: {
    type: "object",
    properties: {
      totalUsers: {
        type: "integer",
        example: 120
      },
      totalQuizzes: {
        type: "integer",
        example: 18
      },
      totalWordsearches: {
        type: "integer",
        example: 9
      },
      totalGuessTheImages: {
        type: "integer",
        example: 14
      },
      totalGuessTheWords: {
        type: "integer",
        example: 11
      }
    }
  },
  AdminChartData: {
    type: "object",
    properties: {
      labels: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["Jan", "Feb", "Mar"]
      },
      values: {
        type: "array",
        items: {
          type: "integer"
        },
        example: [3, 7, 2]
      }
    }
  },
  AdminMostPlayedQuizData: {
    type: "object",
    properties: {
      labels: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["History Quiz", "Science Quiz", "Sports Quiz"]
      },
      datasets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "integer"
              },
              example: [42, 31, 18]
            },
            backgroundColor: {
              type: "array",
              items: {
                type: "string"
              }
            },
            borderColor: {
              type: "array",
              items: {
                type: "string"
              }
            },
            borderWidth: {
              type: "integer",
              example: 1
            }
          }
        }
      }
    }
  },
  AdminGameStatistics: {
    type: "object",
    properties: {
      labels: {
        type: "array",
        items: {
          type: "string",
          enum: ["Quiz", "Scrabble", "Word_Search", "Guess_Image", "Guess_Word", "Match"]
        },
        example: ["Quiz", "Match", "Guess_Image"]
      },
      data: {
        type: "array",
        items: {
          type: "integer"
        },
        example: [25, 14, 9]
      }
    }
  },
  AdminLeaderboardEntry: {
    type: "object",
    properties: {
      userName: {
        type: "string",
        example: "John Doe"
      },
      totalPoints: {
        type: "string",
        example: "250"
      }
    }
  },
  AdminFeedback: {
    type: "object",
    properties: {
      feedbackId: {
        type: "integer",
        example: 1
      },
      userId: {
        type: "integer",
        example: 12
      },
      userName: {
        type: "string",
        example: "Jane Doe"
      },
      rating: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        example: 5
      },
      version: {
        type: "string",
        example: "1.2.3"
      },
      feedback: {
        type: "string",
        nullable: true,
        example: "The new release feels much faster."
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2026-04-08T10:00:00.000Z"
      }
    }
  }
};

export default adminSchemas;
