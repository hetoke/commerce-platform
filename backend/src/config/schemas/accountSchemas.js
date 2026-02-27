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

};

export default accountSchemas;