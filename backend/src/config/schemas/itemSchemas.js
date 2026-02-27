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
};

export default itemSchemas;