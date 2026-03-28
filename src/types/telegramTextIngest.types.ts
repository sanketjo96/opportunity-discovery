/**
 * Subset of Telegram Bot API types for webhook updates (POST /api/ingest).
 * @see https://core.telegram.org/bots/api#update
 */

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  type: string;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  /** Plain text body (text messages). */
  text?: string;
  /** Media caption (photo, video, etc.); use when `text` is absent. */
  caption?: string;
}

/**
 * Telegram webhook payload for a text message update.
 */
export interface TelegramTextIngestPayload {
  update_id: number;
  message: TelegramMessage;
}

/**
 * Mock structured output from the Telegram text ingest pipeline.
 */
export interface TelegramTextIngestStructuredResult {
  id: string;
  receivedAt: string;
  preview: string;
  sourceLabel: string;
}
