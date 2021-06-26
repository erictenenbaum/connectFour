import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName, pkMoveColumnIndex } from "../../config";
import { dynamoMoveItem } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";

export async function getLastRowInColumn(
  gameId: string,
  column: number
): Promise<number> {
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

  const dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
    moveColumnQuery
  );

  dynamoMoveItems.sort(
    (a: dynamoMoveItem, b: dynamoMoveItem) => b.move_row - a.move_row
  );

  return dynamoMoveItems[0] ? dynamoMoveItems[0].move_row : 0;
}
