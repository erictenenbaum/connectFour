import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { dynamoGameItem, GAME_DETAILS } from "../../interfaces";
import { tableName } from "../../config";

export async function getDynamoGameItem(
  gameId: string
): Promise<dynamoGameItem | null> {
  const gameQuery: DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      pk: gameId,
      sk: GAME_DETAILS,
    },
  };
  const gameResult: DocumentClient.GetItemOutput = await documentClient
    .get(gameQuery)
    .promise();

  if (!gameResult.Item) {
    return null;
  }

  return gameResult.Item as dynamoGameItem;
}
