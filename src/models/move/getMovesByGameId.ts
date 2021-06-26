import { documentClient } from "../../utils/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { dynamoMoveItem } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";

export async function getMovesByGameId(
  gameId: string,
  range?: { start?: number; until?: number }
): Promise<dynamoMoveItem[]> {
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

  try {
    const dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
      queryInput
    );
    return dynamoMoveItems;
  } catch (error) {
    throw error;
  }
}
