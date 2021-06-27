import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName, gameStateIndex } from "../../config";
import { dynamoGameItem } from "../../interfaces";
import { documentClient } from "../../utils/dynamo";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getInprogressGames(): Promise<string[]> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get In Progress Games - Model",
  });
  logger.info("Game In Progress Games - Model");
  const queryInput: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: gameStateIndex,
    KeyConditionExpression: "game_state = :gs",
    ExpressionAttributeValues: {
      ":gs": 1,
    },
  };

  logger.info({ query: queryInput }, "Query to get in progress games");

  const queryOutput: DocumentClient.QueryOutput = await documentClient
    .query(queryInput)
    .promise();

  logger.info({ dynamoResponse: queryOutput }, "Dynamo Response");

  return queryOutput.Items
    ? queryOutput.Items.map((item: Partial<dynamoGameItem>) => item.pk!)
    : [];
}
