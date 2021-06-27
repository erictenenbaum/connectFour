import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { dynamoGameItem, GAME_DETAILS } from "../../interfaces";
import { tableName } from "../../config";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getDynamoGameItem(
  gameId: string
): Promise<dynamoGameItem | null> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Game - Model",
  });
  logger.info({ gameId }, "Game Id to Get - Model");

  const gameQuery: DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      pk: gameId,
      sk: GAME_DETAILS,
    },
  };

  logger.info({ query: gameQuery }, "Dynamo Query");

  const gameResult: DocumentClient.GetItemOutput = await documentClient
    .get(gameQuery)
    .promise();

  logger.info({ dynamoResult: gameResult }, "Response from Dynamo");

  if (!gameResult.Item) {
    return null;
  }

  return gameResult.Item as dynamoGameItem;
}
