import { documentClient } from "../../utils/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { dynamoMoveItem } from "../../interfaces";

export async function getMovesByGameId(
  gameId: string
): Promise<dynamoMoveItem[]> {
  const queryInput: DocumentClient.QueryInput = {
    TableName: tableName,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
    ExpressionAttributeValues: {
      ":pk": gameId,
      ":sk": "MOVES#",
    },
  };

  try {
    const queryOutput: DocumentClient.QueryOutput = await documentClient
      .query(queryInput)
      .promise();

    if (queryOutput.Items) {
      return queryOutput.Items as dynamoMoveItem[];
    }

    return [];
  } catch (error) {
    throw error;
  }
}
