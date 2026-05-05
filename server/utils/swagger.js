const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hệ thống Tư vấn Tuyển sinh",
      version: "1.0.0",
      description: "Tài liệu API cho hệ thống tư vấn tuyển sinh",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server",
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
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            role_id: { type: "integer" },
            status: { type: "string", enum: ["active", "banned", "pending"] },
            last_login: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Major: {
          type: "object",
          properties: {
            id: { type: "integer" },
            faculty_id: { type: "integer" },
            code: { type: "string" },
            name: { type: "string" },
            tuition: { type: "number" },
            description: { type: "string" },
            quota: { type: "integer" },
          },
        },
        Specialization: {
          type: "object",
          properties: {
            id: { type: "integer" },
            major_id: { type: "integer" },
            code: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            admission_code: { type: "string" },
          },
        },
        Faculty: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            slug: { type: "string" },
            description: { type: "string" },
            logo_url: { type: "string" },
            banner_image_url: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Quét documentation trong folder routes
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
