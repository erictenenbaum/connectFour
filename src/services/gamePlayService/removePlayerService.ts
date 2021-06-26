import { documentClient } from "../../utils/dynamo";
import { getDynamoGameItem } from "../../models";
import { dynamoGameItem, dynamoMoveItem } from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { v4 as uuidv4 } from "uuid";

export async function removePlayerService(
  gameId: string,
  playerId: string
): Promise<void> {
  const dynamoGameItem: dynamoGameItem | null = await getDynamoGameItem(gameId);

  if (!dynamoGameItem || !dynamoGameItem.game_players.includes(playerId)) {
    throw Error("404");
  }

  // sparse index - game state will only exist on "in progress" games
  if (!dynamoGameItem.game_state) {
    throw Error("410 - Game is Over");
  }

  await updateGameAndWriteQuitMove(dynamoGameItem, playerId);
  return;
}

async function updateGameAndWriteQuitMove(
  dynamoGameItem: dynamoGameItem,
  playerId: string
): Promise<void> {
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

  console.log("EXPRESSION: ", setUpdateExpression + removeUpdateExpression);

  const updateItemInput: DocumentClient.UpdateItemInput = {
    TableName: tableName,
    Key: {
      pk: dynamoGameItem.pk,
      sk: dynamoGameItem.sk,
    },
    UpdateExpression: setUpdateExpression + removeUpdateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  await documentClient.update(updateItemInput).promise();
  await writeQuitMove(dynamoGameItem, playerId);
  return;
}

async function writeQuitMove(
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
