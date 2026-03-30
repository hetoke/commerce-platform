import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import accountSchemas from "./schemas/accountSchemas.ts";
import authSchemas from "./schemas/authSchemas.ts";
import itemSchemas from "./schemas/itemSchemas.ts";
import reviewSchemas from "./schemas/reviewSchemas.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemas = {
  ...accountSchemas,
  ...authSchemas,
  ...itemSchemas,
  ...reviewSchemas
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
  apis: [path.join(__dirname, "../routes/*.ts")],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
