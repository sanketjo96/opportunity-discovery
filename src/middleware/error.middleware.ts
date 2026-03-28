import type { Request, Response, NextFunction } from "express";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return "Unknown error";
}

/**
 * body-parser (used by `express.json()`) signals JSON parse failures with status 400
 * and `type: "entity.parse.failed"` (see body-parser read.js).
 */
function isJsonEntityParseFailed(err: unknown): boolean {
  if (typeof err !== "object" || err === null) {
    return false;
  }
  const e = err as { status?: unknown; type?: unknown };
  return e.status === 400 && e.type === "entity.parse.failed";
}

/**
 * Central error handler — must be registered after routes.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }

  if (isJsonEntityParseFailed(err)) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid JSON body",
    });
    return;
  }

  console.error("[error]", getErrorMessage(err));

  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
}
