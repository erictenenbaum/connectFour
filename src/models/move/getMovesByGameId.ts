import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { dynamoMoveItem } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getMovesByGameId(
  gameId: string,
  range?: { start?: number; until?: number }
): Promise<dynamoMoveItem[]> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Moves By Game Id (Get Moves) - Model",
  });
  logger.info(
    { gameId, range },
    "gameId, range (optional, might be undefined) - Model"
  );

  const queryInput: DocumentClient.QueryInput = {
    TableName: tableName,
    KeyConditionExpression: "pk = :pk AND sk BETWEEN :start AND :until",
    ExpressionAttributeValues: {
      ":pk": gameId,
      ":start": range?.start ? `MOVE#${range.start}` : `MOVE#1`,
      ":until": range?.until
        ? `MOVE#${range.until}`
        : `MOVE#${Number.MAX_SAFE_INTEGER}`,
    },
  };

  logger.info({ query: queryInput }, "Query");

  try {
    const dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
      queryInput
    );

    logger.info({ result: dynamoMoveItems }, "Dynamo Response");
    return dynamoMoveItems;
  } catch (error) {
    logger.info({ err: error }, "Error in the Get Moves Model");
    throw error;
  }
}
