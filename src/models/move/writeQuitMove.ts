import { v4 as uuidv4 } from "uuid";
import { dynamoGameItem, dynamoMoveItem } from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { tableName } from "../../config";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function writeQuitMove(
  dynamoGameItem: dynamoGameItem,
  playerId: string
): Promise<void> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Write Quit Move - Model",
  });
  logger.info(
    { game: dynamoGameItem, playerId },
    "Params Write Quit Move - Model"
  );

  const dynamoMoveItem: Partial<dynamoMoveItem> = {
    pk: dynamoGameItem.pk,
    sk: `MOVE#${0}#${uuidv4()}`,
    move_player: playerId,
  };

  const putItemInput: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: dynamoMoveItem,
  };

  logger.info({ writeRequest: putItemInput }, "Write Request");

  await documentClient.put(putItemInput).promise();
  return;
}
