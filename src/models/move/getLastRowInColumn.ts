import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName, pkMoveColumnIndex } from "../../config";
import { dynamoMoveItem } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getLastRowInColumn(
  gameId: string,
  column: number
): Promise<number> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Last Row in Column - Model",
  });
  logger.info({ gameId, column }, "gameId, column number - Model");

  // get all moves in that column to check if there is still space for another token:
  const moveColumnQuery: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: pkMoveColumnIndex,
    KeyConditionExpression: "pk = :pk AND move_column = :mc",
    ExpressionAttributeValues: {
      ":pk": gameId,
      ":mc": column,
    },
  };

  logger.info({ query: moveColumnQuery }, "Query");

  const dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
    moveColumnQuery
  );

  logger.info({ result: dynamoMoveItems }, "Result");

  dynamoMoveItems.sort(
    (a: dynamoMoveItem, b: dynamoMoveItem) => b.move_row - a.move_row
  );

  logger.info({ sortedResult: dynamoMoveItems }, "Sorted");

  return dynamoMoveItems[0] ? dynamoMoveItems[0].move_row : 0;
}
