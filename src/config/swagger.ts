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
          "Accepts a Telegram Bot API–style update object (update_id + message with text and/or caption). Enqueues a background job on the `ingest` queue (job name `process-message`) and returns immediately.",
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
            description: "Update validated and queued for processing",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TelegramTextIngestQueuedResponse",
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
    "/api/opportunities": {
      get: {
        tags: ["Opportunities"],
        summary: "List all opportunities",
        description:
          "Returns opportunity documents from MongoDB (ingest pipeline), sorted by `createdAt` descending (newest first). Pagination: `page` (1-based, default 1) and `pageSize` (default 20, max 100). Filters are combined with AND. `category` is a single query parameter with comma-separated values (e.g. `category=casting,workshop`); a document matches if its category is any of the listed values (OR). `gender` is an exact match; `location` and `language` are case-insensitive substring matches. Response items exclude Telegram ingest metadata (stored server-side only).",
        operationId: "getOpportunityListings",
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            schema: {
              type: "string",
              example: "casting,workshop",
            },
            description:
              "Comma-separated categories (single `category` param only), e.g. `casting,workshop,music`. Matches documents whose category is any listed value (OR).",
          },
          {
            name: "gender",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["male", "female", "unisex"] },
            description: "Exact gender match",
          },
          {
            name: "location",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Case-insensitive substring match on location",
          },
          {
            name: "language",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Case-insensitive substring match on language",
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, default: 1 },
            description: "Page number (1-based)",
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Items per page (max 100)",
          },
        ],
        responses: {
          "200": {
            description: "List of opportunities",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OpportunityListingResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Invalid query parameter (unknown category or gender, or invalid `page` / `pageSize`)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "Server error (for example MongoDB unavailable or misconfigured)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
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
        required: ["message_id", "from", "chat", "date"],
        properties: {
          message_id: { type: "integer" },
          from: { $ref: "#/components/schemas/TelegramUser" },
          chat: { $ref: "#/components/schemas/TelegramChat" },
          date: { type: "integer", description: "Unix timestamp" },
          text: { type: "string", minLength: 1, description: "Text body (text messages)" },
          caption: {
            type: "string",
            minLength: 1,
            description: "Media caption; at least one of text or caption must be present",
          },
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
      TelegramTextIngestQueuedResponse: {
        type: "object",
        required: ["success", "jobId"],
        properties: {
          success: { type: "boolean", enum: [true] },
          jobId: {
            type: "string",
            description: "BullMQ job id on the ingest queue",
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
      OpportunityListingItem: {
        type: "object",
        required: ["id", "source", "rawText", "title", "description", "category", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string", description: "MongoDB document id" },
          source: { type: "string", example: "telegram" },
          rawText: { type: "string", description: "Original Telegram text or caption" },
          title: { type: "string" },
          description: { type: "string" },
          category: {
            type: "string",
            enum: ["casting", "workshop", "music", "voiceover", "other"],
          },
          gender: { type: "string", enum: ["male", "female", "unisex"] },
          roles: { type: "array", items: { type: "string" } },
          ageRange: { type: "string" },
          location: { type: "string" },
          language: { type: "string" },
          email: { type: "string" },
          url: { type: "string" },
          contact: { type: "string" },
          deadline: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OpportunityListingResponse: {
        type: "object",
        required: ["items", "count", "total", "page", "pageSize", "totalPages"],
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OpportunityListingItem" },
          },
          count: { type: "integer", description: "Number of items in this page" },
          total: { type: "integer", description: "Total documents matching filters (all pages)" },
          page: { type: "integer", description: "Current page (1-based)" },
          pageSize: { type: "integer", description: "Page size used for this request" },
          totalPages: { type: "integer", description: "Total pages for this filter set" },
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
