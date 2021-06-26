import { v4 as uuidv4 } from "uuid";
import { dynamoGameItem, dynamoMoveItem } from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { tableName } from "../../config";

export async function writeQuitMove(
  dynamoGameItem: dynamoGameItem,
  playerId: string
): Promise<void> {
  const dynamoMoveItem: Partial<dynamoMoveItem> = {
    pk: dynamoGameItem.pk,
    sk: `MOVE#${0}#${uuidv4()}`,
    move_player: playerId,
  };

  const putItemInput: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: dynamoMoveItem,
  };

  await documentClient.put(putItemInput).promise();
  return;
}
