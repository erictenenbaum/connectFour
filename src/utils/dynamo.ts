import { DocumentClient } from "aws-sdk/clients/dynamodb";

export const documentClient: DocumentClient = new DocumentClient({
  region: "localhost",
  endpoint: "http://localhost:8000",
});
