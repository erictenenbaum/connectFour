import { documentClient } from "../../utils/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { dynamoMoveItem } from "../../interfaces/move";
import { ErrorMessages } from "../../constants";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getMoveByMoveNumber(
  gameId: string,
  moveNumber: number
): Promise<dynamoMoveItem> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Move by Move Number (Get Move) - Model",
  });
  logger.info({ gameId, moveNumber }, "gameId, Move Number - Model");

  const getItemInput: DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      pk: gameId,
      sk: `MOVE#${moveNumber}`,
    },
  };

  logger.info({ query: getItemInput }, "Query");

  try {
    const getItemOutput: DocumentClient.GetItemOutput = await documentClient
      .get(getItemInput)
      .promise();

    logger.info({ result: getItemOutput }, "Dynamo Response");

    if (!getItemOutput.Item) {
      logger.debug("Move not found - Model");
      throw new Error(ErrorMessages.GameMovesNotFound);
    }

    return getItemOutput.Item as dynamoMoveItem;
  } catch (error) {
    throw error;
  }
}
