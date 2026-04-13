const adsSchemas = {
  AdsRecord: {
    type: "object",
    properties: {
      adsId: {
        type: "integer",
        example: 1
      },
      adsName: {
        type: "string",
        example: "Ramadan Banner"
      },
      description: {
        type: "string",
        nullable: true,
        example: "Seasonal homepage campaign"
      },
      adsImage: {
        type: "string",
        nullable: true,
        example: "banner-image.jpg"
      },
      adsVideo: {
        type: "string",
        nullable: true,
        example: "promo-video.mp4"
      },
      targetUrl: {
        type: "string",
        nullable: true,
        example: "https://example.com/campaign"
      },
      type: {
        type: "string",
        enum: ["Banner", "Video"],
        example: "Banner"
      },
      clicks: {
        type: "integer",
        example: 14
      },
      language: {
        type: "string",
        enum: ["guj", "en"],
        nullable: true,
        example: "en"
      },
      isActive: {
        type: "boolean",
        example: true
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
  AdsCreateRequest: {
    type: "object",
    required: ["type", "adsName", "file"],
    properties: {
      type: {
        type: "string",
        enum: ["Banner", "Video"],
        example: "Banner"
      },
      adsName: {
        type: "string",
        example: "Ramadan Banner"
      },
      description: {
        type: "string",
        example: "Seasonal homepage banner"
      },
      targetUrl: {
        type: "string",
        nullable: true,
        example: "https://example.com/campaign"
      },
      language: {
        type: "string",
        enum: ["guj", "en"],
        example: "en"
      },
      isActive: {
        type: "boolean",
        example: true
      },
      file: {
        type: "string",
        format: "binary"
      }
    }
  },
  AdsUpdateRequest: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["Banner", "Video"],
        example: "Banner"
      },
      adsName: {
        type: "string",
        example: "Updated Ramadan Banner"
      },
      description: {
        type: "string",
        example: "Updated campaign copy"
      },
      targetUrl: {
        type: "string",
        nullable: true,
        example: "https://example.com/updated-campaign"
      },
      language: {
        type: "string",
        enum: ["guj", "en"],
        example: "guj"
      },
      file: {
        type: "string",
        format: "binary"
      }
    }
  },
  AdsStatusUpdateResponse: {
    type: "array",
    example: []
  },
  AdsDeleteResponse: {
    type: "object",
    nullable: true,
    example: null
  },
  AdsClickRequestQuery: {
    type: "object",
    properties: {
      adsId: {
        type: "integer",
        example: 1
      },
      userId: {
        type: "integer",
        example: 10
      }
    }
  }
};

export default adsSchemas;
