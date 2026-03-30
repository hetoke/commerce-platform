const accountSchemas = {
  UpdateUsernameRequest: {
    type: "object",
    required: ["newUsername"],
    properties: {
      newUsername: {
        type: "string",
        example: "new_user123",
      },
    },
  },

  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: { type: "string" },
      newPassword: { type: "string" },
    },
  },

  UserProfile: {
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      email: { type: "string" },
    },
  },

  /**
   * Detailed profile returned by GET /api/account/profile.
   * Includes role and timestamps.
   */
  UserProfileDetail: {
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      email: { type: "string" },
      role: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    required: ["id", "username", "email", "role", "createdAt", "updatedAt"],
  },

  /**
   * Public representation of a user – used in responses where the client needs
   * to know the user's id, username, email and role.
   */
  UserPublic: {
    type: "object",
    properties: {
      id: { type: "string" },
      username: { type: "string" },
      email: { type: "string" },
      role: { type: "string" },
    },
  },

  /**
   * Response schema for the update‑username endpoint.
   */
  UpdateUsernameResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Username updated successfully" },
      user: { $ref: "#/components/schemas/UserPublic" },
    },
    required: ["message", "user"],
  },

  /**
   * Generic success response containing a message.
   */
  SuccessResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },

  /**
   * Generic error response used throughout the API.
   */
  ErrorResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
};

export default accountSchemas;
