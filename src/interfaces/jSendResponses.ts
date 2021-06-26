import { StatusCodes } from "http-status-codes";

export interface JSendResponse {
  status: string;
  data?: unknown;
  message?: string;
}

export interface JSendResponseWrapper {
  statusCode: StatusCodes;
  body: string;
}
