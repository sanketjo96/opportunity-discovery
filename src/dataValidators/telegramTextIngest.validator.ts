import type {
  TelegramChat,
  TelegramMessage,
  TelegramTextIngestPayload,
  TelegramUser,
} from "../types/telegramTextIngest.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTelegramUser(value: unknown): TelegramUser | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, is_bot, first_name, last_name, username, language_code } = value;
  if (typeof id !== "number" || typeof is_bot !== "boolean" || typeof first_name !== "string") {
    return null;
  }
  if (last_name !== undefined && typeof last_name !== "string") {
    return null;
  }
  if (username !== undefined && typeof username !== "string") {
    return null;
  }
  if (language_code !== undefined && typeof language_code !== "string") {
    return null;
  }
  return {
    id,
    is_bot,
    first_name,
    ...(typeof last_name === "string" ? { last_name } : {}),
    ...(typeof username === "string" ? { username } : {}),
    ...(typeof language_code === "string" ? { language_code } : {}),
  };
}

function parseTelegramChat(value: unknown): TelegramChat | null {
  if (!isRecord(value)) {
    return null;
  }
  const { id, first_name, last_name, username, type } = value;
  if (typeof id !== "number" || typeof type !== "string") {
    return null;
  }
  if (first_name !== undefined && typeof first_name !== "string") {
    return null;
  }
  if (last_name !== undefined && typeof last_name !== "string") {
    return null;
  }
  if (username !== undefined && typeof username !== "string") {
    return null;
  }
  return {
    id,
    type,
    ...(typeof first_name === "string" ? { first_name } : {}),
    ...(typeof last_name === "string" ? { last_name } : {}),
    ...(typeof username === "string" ? { username } : {}),
  };
}

function parseTelegramMessage(value: unknown): TelegramMessage | null {
  if (!isRecord(value)) {
    return null;
  }
  const { message_id, from, chat, date, text, caption } = value;
  if (typeof message_id !== "number" || typeof date !== "number") {
    return null;
  }
  const textTrim = typeof text === "string" ? text.trim() : "";
  const captionTrim = typeof caption === "string" ? caption.trim() : "";
  if (textTrim.length === 0 && captionTrim.length === 0) {
    return null;
  }
  const fromUser = parseTelegramUser(from);
  const chatObj = parseTelegramChat(chat);
  if (fromUser === null || chatObj === null) {
    return null;
  }
  return {
    message_id,
    from: fromUser,
    chat: chatObj,
    date,
    ...(textTrim.length > 0 ? { text: textTrim } : {}),
    ...(captionTrim.length > 0 ? { caption: captionTrim } : {}),
  };
}

/**
 * Parses and validates a Telegram webhook body into {@link TelegramTextIngestPayload}, or null if invalid.
 */
export function parseTelegramTextIngestPayload(body: unknown): TelegramTextIngestPayload | null {
  if (!isRecord(body)) {
    return null;
  }
  const { update_id, message } = body;
  if (typeof update_id !== "number") {
    return null;
  }
  const msg = parseTelegramMessage(message);
  if (msg === null) {
    return null;
  }
  return { update_id, message: msg };
}
