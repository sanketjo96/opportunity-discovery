import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition: swaggerJsdoc.OAS3Definition = {
  openapi: "3.0.3",
  info: {
    title: "Opportunity Discovery API",
    version: "1.0.0",
    description: "Webhook ingest and related endpoints.",
  },
  servers: [
    {
      url: "/",
      description: "Current host",
    },
  ],
  paths: {
    "/api/ingest": {
      post: {
        tags: ["Text ingest"],
        summary: "Ingest text from a webhook",
        description:
          "Accepts raw message text (e.g. forwarded from a Telegram bot). Returns a mock structured result.",
        operationId: "postIngest",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TextIngestRequest",
              },
              examples: {
                telegram: {
                  summary: "With source",
                  value: {
                    text: "Casting call: lead role, Mumbai, apply by Friday.",
                    source: "telegram",
                  },
                },
                minimal: {
                  summary: "Text only",
                  value: {
                    text: "Workshop announcement for actors.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Message accepted and processed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TextIngestSuccessResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Invalid JSON body, missing/invalid `text`, or malformed request",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  missingText: {
                    summary: "Validation error",
                    value: {
                      error: "Bad Request",
                      message:
                        "Request body must include a non-empty string field: text",
                    },
                  },
                  invalidJson: {
                    summary: "Malformed JSON (body-parser)",
                    value: {
                      error: "Bad Request",
                      message: "Invalid JSON body",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      TextIngestRequest: {
        type: "object",
        required: ["text"],
        properties: {
          text: {
            type: "string",
            description: "Raw message body to ingest",
            minLength: 1,
          },
          source: {
            type: "string",
            description: "Optional origin label (e.g. telegram, webhook)",
          },
        },
      },
      TextIngestStructuredResult: {
        type: "object",
        required: ["id", "receivedAt", "preview", "sourceLabel"],
        properties: {
          id: { type: "string", format: "uuid" },
          receivedAt: { type: "string", format: "date-time" },
          preview: { type: "string" },
          sourceLabel: { type: "string" },
        },
      },
      TextIngestSuccessResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", enum: [true] },
          data: {
            $ref: "#/components/schemas/TextIngestStructuredResult",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error", "message"],
        properties: {
          error: { type: "string", example: "Bad Request" },
          message: { type: "string" },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
