import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { move, dynamoGameItem } from "../../interfaces";
import { tableName } from "../../config";
import { documentClient } from "../../utils/dynamo";
import { writeMove } from "./writeMove";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function updateGameAndWriteMove(
  currentMove: move,
  dynamoGameItem: dynamoGameItem,
  isGameOver: boolean,
  isWin?: boolean
): Promise<string> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Update Game and Write Move - Model",
  });
  logger.info(
    { currentMove, dynamoGameItem, isGameOver, isWin },
    "Params for Update Game and Write Move - Model"
  );

  const gameCurrentPlayer: string = getGameCurrentPlayer(
    currentMove,
    dynamoGameItem
  );

  logger.info({ currentPlayer: gameCurrentPlayer }, "Current Player");

  let updateExpression =
    "SET game_current_player = :gcp, game_played_moves = :gpm";

  let expressionAttributeValues = {
    ":gcp": gameCurrentPlayer,
    ":gpm": dynamoGameItem.game_played_moves + 1,
  };

  if (isGameOver) {
    updateExpression += ", winner = :w REMOVE game_state";
    // TODO: look into empty value data entries: https://aws.amazon.com/about-aws/whats-new/2020/05/amazon-dynamodb-now-supports-empty-values-for-non-key-string-and-binary-attributes-in-dynamodb-tables/
    expressionAttributeValues[":w"] = isWin ? currentMove.playerId : "";
  }

  const updateItemInput: DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      pk: dynamoGameItem.pk,
      sk: dynamoGameItem.sk,
    },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  logger.info({ writeRequest: updateItemInput }, "Write Request");

  await documentClient.update(updateItemInput).promise();
  return writeMove(currentMove, dynamoGameItem);
}

function getGameCurrentPlayer(
  currentMove: move,
  dynamoGameItem: dynamoGameItem
): string {
  const currentPlayerIndex: number = dynamoGameItem.game_players.indexOf(
    currentMove.playerId
  );

  const gameCurrentPlayer: string =
    currentPlayerIndex === dynamoGameItem.game_players.length - 1
      ? dynamoGameItem.game_players[0]
      : dynamoGameItem.game_players[currentPlayerIndex + 1];

  return gameCurrentPlayer;
}
