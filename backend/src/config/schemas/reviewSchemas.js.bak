const reviewSchemas = {
  /**
   * Review object returned by the API.
   */
  Review: {
    type: "object",
    properties: {
      id: { type: "string" },
      rating: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Rating given by the user (1‑5).",
      },
      comment: { type: "string", description: "Optional textual comment." },
      user: { $ref: "#/components/schemas/UserPublic" },
      createdAt: { type: "string", format: "date-time" },
    },
    required: ["id", "rating", "user", "createdAt"],
  },

  /**
   * Payload for creating or updating a review (upsert).
   */
  UpsertReviewRequest: {
    type: "object",
    required: ["rating"],
    properties: {
      rating: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Rating between 1 and 5.",
        example: 4,
      },
      comment: {
        type: "string",
        description: "Optional comment for the review.",
        example: "Great product!",
      },
    },
  },
};

export default reviewSchemas;
