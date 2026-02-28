import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import accountSchemas from "./schemas/accountSchemas.js";
import authSchemas from "./schemas/authSchemas.js";
import itemSchemas from "./schemas/itemSchemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemas = {
  ...accountSchemas,
  ...authSchemas,
  ...itemSchemas
};

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hetoke Shop API",
      version: "1.0.0",
      description: "API documentation for your marketplace app",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas,
    },
  },
  apis: [path.join(__dirname, "../routes/*.js")], // 🔥 IMPORTANT
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;