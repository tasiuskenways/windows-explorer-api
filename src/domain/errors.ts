export class NotFoundError extends Error {
  readonly code = "NOT_FOUND";
  constructor(message: string) { super(message); this.name = "NotFoundError"; }
}
export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  constructor(message: string, readonly details?: unknown) { super(message); this.name = "ValidationError"; }
}
