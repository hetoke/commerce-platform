const authSchemas = {
  AuthResponse: {
    type: "object",
    required: ["accessToken", "user"],
    properties: {
      accessToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      user: {
        $ref: "#/components/schemas/UserPublic",
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

  /**
   * Response payload for the refresh endpoint. The controller returns a simple
   * message indicating the rotation of tokens; the actual tokens are sent via
   * HttpOnly cookies, not in the JSON body.
   */
  RefreshResponse: {
    type: "object",
    required: ["message"],
    properties: {
      message: {
        type: "string",
        example: "Token rotated.",
        description: "Indicates that new access and refresh tokens have been issued.",
      },
    },
  },

  GoogleAuthRequest: {
    type: "object",
    required: ["credential"],
    properties: {
      credential: {
        type: "string",
        description: "Google ID token (JWT) obtained from the client.",
        example: "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
      },
    },
  },
};

export default authSchemas;
