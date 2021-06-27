import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { move } from "../../interfaces";
import { documentClient } from "../../utils/dynamo";
import { dynamoMoveItem, dynamoGameItem } from "../../interfaces";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function writeMove(
  currentMove: move,
  dynamoGameItem: dynamoGameItem
): Promise<string> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Write Move - Model",
  });
  logger.info(
    { currentMove, game: dynamoGameItem },
    "Params Write Move - Model"
  );

  const dynamoMoveItem: dynamoMoveItem = {
    pk: dynamoGameItem.pk,
    sk: `MOVE#${currentMove.moveNumber}`,
    move_player: currentMove.playerId,
    move_column: currentMove.column,
    move_row: currentMove.row,
  };

  const putItemInput: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: dynamoMoveItem,
  };

  logger.info({ writeRequest: putItemInput }, "Write Request");

  await documentClient.put(putItemInput).promise();
  return `${dynamoGameItem.pk}/moves/${dynamoGameItem.game_played_moves + 1}`;
}
