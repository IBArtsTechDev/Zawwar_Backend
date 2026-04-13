import swaggerJSDoc from "swagger-jsdoc";
import schemas from "./swagger/schemas/index.js";
import getEnv from "./envReader.js";

const environment = getEnv.NODE_ENV === "development";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Zawwar App API",
      version: "1.0.0",
      description: "API documentation for Zawwar App"
    },
    servers: [
      {
        url: environment ? getEnv.DEV_URL : getEnv.PROD_URL
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas
    }
  },
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
