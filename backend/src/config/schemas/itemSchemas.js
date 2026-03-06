const itemSchemas = {
  Item: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string", example: "MacBook Pro" },
      price: { type: "number", example: 1500 },
      location: { type: "string", example: "New York" },
      description: { type: "string" },
      detailedDescription: { type: "string" },
      averageRating: { type: "number", example: 4.5 },
      reviewCount: { type: "number", example: 12 },
      sellCount: { type: "number", example: 30 },
      createdAt: { type: "string", format: "date-time" },
    },
  },

  CreateItemRequest: {
    type: "object",
    required: ["name", "price", "location", "description"],
    properties: {
      name: { type: "string" },
      price: { type: "number" },
      location: { type: "string" },
      description: { type: "string" },
      detailedDescription: { type: "string" },
      path: { type: "string" },
    },
  },

  UpdateItemRequest: {
    type: "object",
    properties: {
      name: { type: "string" },
      price: { type: "number" },
      location: { type: "string" },
      description: { type: "string" },
      detailedDescription: { type: "string" },
      path: { type: "string" },
    },
  },

  Purchase: {
    type: "object",
    properties: {
      id: { type: "string" },
      item: { $ref: "#/components/schemas/Item" },
      user: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
    },
  },

  /**
   * Response schema for a successful image upload.
   */
  UploadImageResponse: {
    type: "object",
    properties: {
      path: {
        type: "string",
        example: "/uploads/abc123.jpg",
        description: "Relative URL/path to the uploaded image.",
      },
    },
    required: ["path"],
  },

  /**
   * Customer‑facing view of a purchase (used by GET /api/purchases/me).
   */
  CustomerPurchaseItem: {
    type: "object",
    properties: {
      id: { type: "string", description: "Purchase record ID" },
      itemId: { type: "string", description: "ID of the purchased item" },
      name: { type: "string" },
      price: { type: "number" },
      location: { type: "string" },
      description: { type: "string" },
      path: { type: "string", description: "Image path of the item" },
      purchasedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "itemId", "name", "price", "location", "description", "path", "purchasedAt"],
  },

  /**
   * Generic error response used by many endpoints.
   */
  ErrorResponse: {
    type: "object",
    properties: {
      message: {
        type: "string",
        example: "Invalid request payload",
        description: "Human‑readable error description.",
      },
    },
    required: ["message"],
  },
};

export default itemSchemas;
