import { JSendResponse, JSendResponseWrapper, JSendFail } from "../interfaces";
import { ErrorMessages } from "../constants";
import { StatusCodes } from "http-status-codes";

export const success = (
  data?: unknown,
  statusCode?: StatusCodes
): JSendResponseWrapper => {
  const jSendResponse: JSendResponse = {
    status: "success",
    data: data || null,
  };

  return {
    statusCode: statusCode || StatusCodes.OK,
    body: JSON.stringify(jSendResponse),
  };
};

export const fail = (
  data: unknown,
  statusCode?: StatusCodes
): JSendResponseWrapper => {
  const jSendResponse: JSendResponse = {
    status: "fail",
    data: data,
  };

  return {
    statusCode: statusCode || StatusCodes.BAD_REQUEST,
    body: JSON.stringify(jSendResponse),
  };
};

export const error = (
  message?: string,
  data?: unknown,
  statusCode?: StatusCodes
): JSendResponseWrapper => {
  const jSendResponse: JSendResponse = {
    status: "error",
    message: message || ErrorMessages.InternalServerError,
    data,
  };

  return {
    statusCode: statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    body: JSON.stringify(jSendResponse),
  };
};

export const catchErrors = (e: Error | JSendFail): JSendResponseWrapper => {
  const message = typeof e === "string" ? e : e?.message;

  if (e instanceof JSendFail) {
    if (e.paramKeys) {
      const failObject = {};

      for (const key of e.paramKeys) {
        failObject[key] = message;
      }
      return fail(failObject);
    }

    return fail(message);
  } else {
    return error(message);
  }
};
