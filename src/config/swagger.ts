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
        tags: ["TelegramTextIngest"],
        summary: "Ingest a Telegram text message update",
        description:
          "Accepts a Telegram Bot API–style update object (update_id + message with text). Returns a mock structured result.",
        operationId: "postTelegramTextIngest",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TelegramTextIngestRequest",
              },
              examples: {
                privateMessage: {
                  summary: "Private chat text message",
                  value: {
                    update_id: 886851032,
                    message: {
                      message_id: 6,
                      from: {
                        id: 5354571573,
                        is_bot: false,
                        first_name: "Sanket",
                        last_name: "Joshi",
                        language_code: "en",
                      },
                      chat: {
                        id: 5354571573,
                        first_name: "Sanket",
                        last_name: "Joshi",
                        type: "private",
                      },
                      date: 1774692258,
                      text: "Hellos",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Update accepted and processed",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TelegramTextIngestSuccessResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Invalid JSON body, or body does not match Telegram update shape (update_id, message with text)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                examples: {
                  validation: {
                    summary: "Validation error",
                    value: {
                      error: "Bad Request",
                      message:
                        "Request body must be a Telegram update with numeric update_id and message (message_id, from, chat, date, non-empty text)",
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
      TelegramUser: {
        type: "object",
        required: ["id", "is_bot", "first_name"],
        properties: {
          id: { type: "integer" },
          is_bot: { type: "boolean" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          language_code: { type: "string" },
        },
      },
      TelegramChat: {
        type: "object",
        required: ["id", "type"],
        properties: {
          id: { type: "integer" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          type: { type: "string", example: "private" },
        },
      },
      TelegramMessage: {
        type: "object",
        required: ["message_id", "from", "chat", "date", "text"],
        properties: {
          message_id: { type: "integer" },
          from: { $ref: "#/components/schemas/TelegramUser" },
          chat: { $ref: "#/components/schemas/TelegramChat" },
          date: { type: "integer", description: "Unix timestamp" },
          text: { type: "string", minLength: 1 },
        },
      },
      TelegramTextIngestRequest: {
        type: "object",
        required: ["update_id", "message"],
        properties: {
          update_id: { type: "integer" },
          message: { $ref: "#/components/schemas/TelegramMessage" },
        },
      },
      TelegramTextIngestStructuredResult: {
        type: "object",
        required: ["id", "receivedAt", "preview", "sourceLabel"],
        properties: {
          id: { type: "string", format: "uuid" },
          receivedAt: { type: "string", format: "date-time" },
          preview: { type: "string" },
          sourceLabel: { type: "string", example: "telegram:private" },
        },
      },
      TelegramTextIngestSuccessResponse: {
        type: "object",
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", enum: [true] },
          data: {
            $ref: "#/components/schemas/TelegramTextIngestStructuredResult",
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
