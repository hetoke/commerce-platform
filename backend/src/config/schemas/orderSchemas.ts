const orderSchemas = {
  OrderItem: {
    type: "object",
    properties: {
      id: { type: "string", description: "Item ID" },
      name: { type: "string" },
      location: { type: "string" },
      price: { type: "number", example: 36 },
      quantity: { type: "number", example: 2 },
      purchasedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "name", "location", "price", "quantity", "purchasedAt"],
  },
  OrderCustomerInfo: {
    type: "object",
    properties: {
      name: { type: "string" },
      phoneNumber: { type: "string" },
      receivedLocation: { type: "string" },
      paymentMethod: {
        type: "string",
        enum: ["Cash", "Momo"],
      },
    },
    required: ["name", "phoneNumber", "receivedLocation", "paymentMethod"],
  },
  Order: {
    type: "object",
    properties: {
      id: { type: "string" },
      items: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderItem" },
      },
      totalQuantity: { type: "number", example: 3 },
      totalPrice: { type: "number", example: 108 },
      createdAt: { type: "string", format: "date-time" },
      status: {
        type: "string",
        enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      },
      customerInfo: { $ref: "#/components/schemas/OrderCustomerInfo" },
    },
    required: [
      "id",
      "items",
      "totalQuantity",
      "totalPrice",
      "createdAt",
      "status",
      "customerInfo",
    ],
  },
  CreateOrderRequest: {
    type: "object",
    properties: {
      purchaseIds: {
        type: "array",
        items: { type: "string" },
      },
      customerInfo: { $ref: "#/components/schemas/OrderCustomerInfo" },
    },
    required: ["purchaseIds", "customerInfo"],
  },
};

export default orderSchemas;
