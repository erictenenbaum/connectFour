import { JSendResponse } from "./jSendResponses";

export interface ResponseSerializer {
  statusCode: number;
  body: JSendResponse;
}

export interface RequestSerializer {
  body: unknown;
  method: string;
  path: string;
  pathParameters: unknown;
  queryStringParameters: unknown;
  headers: unknown;
  requestId: string;
  stage: string;
}

export interface LoggerConfig {
  transactionId?: string;
  user?: string | null;
  logGroup?: string | null;
}
