import { Elysia } from "elysia";
import { NotFoundError, ValidationError } from "../domain/errors.ts";

export const errorHandler = new Elysia({ name: "error-handler" }).onError({ as: "global" }, ({ error, set }) => {
  if (error instanceof NotFoundError) {
    set.status = 404;
    return { error: { code: error.code, message: error.message } };
  }
  if (error instanceof ValidationError) {
    set.status = 400;
    return { error: { code: error.code, message: error.message, details: error.details } };
  }
  set.status = 500;
  return { error: { code: "INTERNAL", message: "Unexpected error" } };
});
