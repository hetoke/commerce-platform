const authSchemas = {
  AuthResponse: {
    type: "object",
    properties: {
      accessToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
        },
      },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        example: "john@email.com",
      },
      password: {
        type: "string",
        example: "Password123",
      },
    },
  },

  SignupRequest: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", example: "john_doe" },
      email: { type: "string", example: "john@email.com" },
      password: { type: "string", example: "Password123" },
    },
  },

  RefreshResponse: {
    type: "object",
    properties: {
      accessToken: {
        type: "string",
      },
    },
  },
};

export default authSchemas;