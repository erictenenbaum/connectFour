import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const documentClient: DocumentClient =
  process.env.IS_OFFLINE === "true"
    ? new DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000",
      })
    : new DocumentClient();
