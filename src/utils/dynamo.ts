import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const documentClient: DocumentClient =
  process.env.IS_OFFLINE === "true"
    ? new DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000",
      })
    : new DocumentClient({
        region: process.env.APP_AWS_REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      });
