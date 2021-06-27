import { dynamoGameItem } from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { tableName } from "../../config";
import { writeQuitMove } from "./writeQuitMove";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function updateGameAndWriteQuitMove(
  dynamoGameItem: dynamoGameItem,
  playerId: string
): Promise<void> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Update Game and Write Quit Move - Model",
  });
  logger.info(
    { game: dynamoGameItem, playerId },
    "Params for Update Game and Write Move - Model"
  );

  // check if quitting player is the current player, and move to the next player if needed
  let gameCurrentPlayer: string = dynamoGameItem.game_current_player;
  if (gameCurrentPlayer === playerId) {
    const currentPlayerIndex: number =
      dynamoGameItem.game_players.indexOf(playerId);

    gameCurrentPlayer =
      currentPlayerIndex === dynamoGameItem.game_players.length - 1
        ? dynamoGameItem.game_players[0]
        : dynamoGameItem.game_players[currentPlayerIndex + 1];
  }

  logger.info({ currentPlayer: gameCurrentPlayer }, "Updated Current Player");

  let removeUpdateExpression: DocumentClient.UpdateExpression = ` REMOVE game_players[${dynamoGameItem.game_players.indexOf(
    playerId
  )}]`;
  let setUpdateExpression: DocumentClient.UpdateExpression = `SET game_current_player = :gcp`;
  let expressionAttributeValues: DocumentClient.ExpressionAttributeValueMap = {
    ":gcp": gameCurrentPlayer,
  };

  //   check if there is only one player remaining and crown them winner:
  if (dynamoGameItem.game_players.length - 1 <= 1) {
    const winningPlayer: string = dynamoGameItem.game_players.filter(
      (player: string) => player !== playerId
    )[0];

    setUpdateExpression += ", winner = :w";
    expressionAttributeValues[":w"] = winningPlayer;
    removeUpdateExpression += ", game_state";
  }

  const updateItemInput: DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      pk: dynamoGameItem.pk,
      sk: dynamoGameItem.sk,
    },
    UpdateExpression: setUpdateExpression + removeUpdateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  logger.info({ writeRequest: updateItemInput }, "Write Request");

  await documentClient.update(updateItemInput).promise();
  await writeQuitMove(dynamoGameItem, playerId);
  return;
}
