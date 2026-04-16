const userSchemas = {
  UserLoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        example: "john@example.com"
      },
      password: {
        type: "string",
        example: "Password@123"
      },
      fcmToken: {
        type: "string",
        example: "sample-fcm-token"
      }
    }
  },
  UserSignupRequest: {
    type: "object",
    required: ["userName", "userEmail", "password", "confirmPassword"],
    properties: {
      userName: {
        type: "string",
        example: "John Doe"
      },
      userEmail: {
        type: "string",
        example: "john@example.com"
      },
      password: {
        type: "string",
        example: "Password@123"
      },
      confirmPassword: {
        type: "string",
        example: "Password@123"
      }
    }
  },
  GenerateAccessTokenRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  },
  GenerateAccessTokenResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Access token generated successfully"
      },
      statusCode: {
        type: "integer",
        example: 200
      },
      data: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          },
          refreshToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      }
    }
  },
  CheckUsernameResponse: {
    type: "object",
    properties: {
      available: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Username is available"
      }
    }
  },
  CheckUsernameValidationErrorResponse: {
    type: "object",
    properties: {
      available: {
        type: "boolean",
        example: false
      },
      message: {
        type: "string",
        example: "Username must be at least 3 characters"
      }
    }
  },
  UserProfileUpdateRequest: {
    type: "object",
    properties: {
      userName: {
        type: "string"
      },
      userEmail: {
        type: "string"
      },
      phoneNo: {
        type: "string"
      },
      countryCode: {
        type: "string"
      },
      dob: {
        type: "string"
      },
      password: {
        type: "string"
      },
      profile_avatar: {
        type: "string",
        format: "binary"
      }
    }
  },
  SocialLoginRequest: {
    type: "object",
    required: ["data", "fcmToken"],
    example: {
      data: {
        user: {
          id: "google-user-id-123",
          email: "john@example.com",
          name: "John Doe"
        }
      },
      fcmToken: "sample-fcm-token"
    },
    properties: {
      data: {
        type: "object",
        required: ["user"],
        properties: {
          user: {
            type: "object",
            required: ["id", "email", "name"],
            properties: {
              id: {
                type: "string",
                example: "google-user-id-123"
              },
              email: {
                type: "string",
                example: "john@example.com"
              },
              name: {
                type: "string",
                example: "John Doe"
              }
            }
          }
        }
      },
      fcmToken: {
        type: "string",
        example: "sample-fcm-token"
      }
    }
  },
  UserScoreUpdateRequest: {
    type: "object",
    required: ["userId", "points"],
    properties: {
      userId: {
        type: "integer",
        example: 1
      },
      points: {
        type: "integer",
        example: 10
      }
    }
  },
  VerifyOtpRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        example: "john@example.com"
      },
      otp: {
        type: "string",
        example: "1234"
      }
    }
  },
  ChangePasswordRequest: {
    type: "object",
    required: ["email", "otp", "password"],
    properties: {
      email: {
        type: "string",
        example: "john@example.com"
      },
      otp: {
        type: "string",
        example: "1234"
      },
      password: {
        type: "string",
        example: "NewPassword@123"
      }
    }
  },
  ContactUsRequest: {
    type: "object",
    required: ["name", "email", "subject", "message"],
    properties: {
      name: {
        type: "string",
        example: "John Doe"
      },
      email: {
        type: "string",
        example: "john@example.com"
      },
      subject: {
        type: "string",
        example: "Need support"
      },
      message: {
        type: "string",
        example: "I am facing an issue while using the app."
      }
    }
  },
  UserFeedbackRequest: {
    type: "object",
    required: ["userId", "rating", "version"],
    properties: {
      userId: {
        type: "integer",
        example: 1
      },
      rating: {
        type: "integer",
        example: 5
      },
      version: {
        type: "string",
        example: "1.0.0"
      },
      feedback: {
        type: "string",
        example: "Great app experience."
      }
    }
  },
  AppleLoginRequest: {
    type: "object",
    properties: {
      jwtToken: {
        type: "string",
        example: "apple-jwt-token"
      },
      fcmToken: {
        type: "string",
        example: "sample-fcm-token"
      },
      name: {
        type: "string",
        example: "John Doe"
      }
    }
  },
  ReviewGivenRequest: {
    type: "object",
    required: ["userId"],
    properties: {
      userId: {
        type: "integer",
        example: 1
      }
    }
  }
};

export default userSchemas;
