import {
  createMoveRequest,
  dynamoGameItem,
  dynamoMoveItem,
  GAME_DETAILS,
  move,
} from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { documentClient } from "../../utils/dynamo";
import { pkMoveColumnIndex, pkMovePlayerIndex, tableName } from "../../config";
import { checkWin } from "../checkWinService";
import { getDynamoGameItem } from "../../models";

export async function createMoveService(
  createMoveRequest: createMoveRequest
): Promise<string> {
  try {
    const { gameId, playerId, column } = createMoveRequest;
    const dynamoGameItem: dynamoGameItem | null = await getDynamoGameItem(
      gameId
    );

    if (!dynamoGameItem) {
      throw new Error("Illegal Move - Game Not Found.");
    }

    if (!isLegalMove(playerId, column, dynamoGameItem)) {
      throw new Error("Illegal Move");
    }

    const lastRowInColumn: number = await getLastRowInColumn(gameId, column);
    if (lastRowInColumn === dynamoGameItem.game_rows) {
      throw new Error("Illegal Move");
    }

    // get all moves by this player (plus current move) to check if they won, or game ended in a tie, then write to DB:
    const [moves, lastMove] = await getAllPlayerMovesAndLastMove(
      gameId,
      playerId
    );

    const currentMove: move = {
      gameId,
      playerId,
      column,
      moveNumber: lastMove + 1,
      row: lastRowInColumn + 1,
    };
    moves.push(currentMove);

    // check if they've won
    if (
      moves.length + 1 >= dynamoGameItem.winSpaces &&
      checkWin(moves, dynamoGameItem.winSpaces)
    ) {
      return await updateGameAndWriteMove(
        currentMove,
        dynamoGameItem,
        true,
        true
      );
    }

    // check tie:
    if (
      dynamoGameItem.game_played_moves + 1 ===
      dynamoGameItem.game_columns * dynamoGameItem.game_rows
    ) {
      return await updateGameAndWriteMove(
        currentMove,
        dynamoGameItem,
        true,
        false
      );
    }

    // write move:
    return await updateGameAndWriteMove(currentMove, dynamoGameItem, false);
  } catch (error) {
    console.log("ERROR IN SERVICE: ", error);
    throw new Error();
  }
}

async function getAllPlayerMovesAndLastMove(
  gameId: string,
  playerId: string
): Promise<[move[], number]> {
  const movePlayerQuery: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: pkMovePlayerIndex,
    KeyConditionExpression: "pk = :pk AND move_player = :mp",
    ExpressionAttributeValues: {
      ":pk": gameId,
      ":mp": playerId,
    },
  };

  let dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
    movePlayerQuery
  );

  let lastMove = 0;
  const moves: move[] = dynamoMoveItems
    .map((item: dynamoMoveItem) => {
      const moveNumber = Number.parseInt(item.sk.split("#")[1]);
      if (moveNumber > lastMove) {
        lastMove = moveNumber;
      }

      const move: move = {
        gameId,
        playerId,
        moveNumber,
        column: item.move_column,
        row: item.move_row,
      };

      return move;
    })
    // Quit moves will have a moveNumber, column and row value of 0
    .filter((move: move) => move.moveNumber > 0);
  return [moves, lastMove];
}

async function dynamoMoveItemQuery(
  query: DocumentClient.QueryInput
): Promise<dynamoMoveItem[]> {
  let dynamoMoveItemResult: DocumentClient.QueryOutput = await documentClient
    .query(query)
    .promise();

  if (dynamoMoveItemResult.Items) {
    let dynamoMoveItems: dynamoMoveItem[] =
      dynamoMoveItemResult.Items as dynamoMoveItem[];

    while (dynamoMoveItemResult.LastEvaluatedKey) {
      let dynamoMoveItemResult: DocumentClient.QueryOutput =
        await documentClient.query(query).promise();

      if (dynamoMoveItemResult.Items) {
        dynamoMoveItems = [
          ...dynamoMoveItems,
          ...(dynamoMoveItemResult.Items as dynamoMoveItem[]),
        ];
      }
    }
    return dynamoMoveItems;
  }
  return [];
}

function isLegalMove(
  playerId: string,
  column: number,
  dynamoGameItem: dynamoGameItem
): boolean {
  // game_state is a sparse index - so it will either exist (with a value of 1) or the field will not be present.
  if (!dynamoGameItem.game_state) {
    return false;
  }

  if (!dynamoGameItem.game_players.includes(playerId)) {
    return false;
  }

  if (dynamoGameItem.game_current_player !== playerId) {
    return false;
  }

  if (column > dynamoGameItem.game_columns) {
    return false;
  }

  return true;
}

async function getLastRowInColumn(
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

async function updateGameAndWriteMove(
  currentMove: move,
  dynamoGameItem: dynamoGameItem,
  isGameOver: boolean,
  isWin?: boolean
): Promise<string> {
  const gameCurrentPlayer: string = getGameCurrentPlayer(
    currentMove,
    dynamoGameItem
  );

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

  await documentClient.update(updateItemInput).promise();
  return writeMove(currentMove, dynamoGameItem);
}

async function writeMove(
  currentMove: move,
  dynamoGameItem: dynamoGameItem
): Promise<string> {
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

  await documentClient.put(putItemInput).promise();
  return `${dynamoGameItem.pk}/moves/${dynamoGameItem.game_played_moves + 1}`;
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

// async function getDynamoGameItem(
//   gameId: string
// ): Promise<dynamoGameItem | null> {
//   const gameQuery: DocumentClient.GetItemInput = {
//     TableName: tableName,
//     Key: {
//       pk: gameId,
//       sk: GAME_DETAILS,
//     },
//   };
//   const gameResult: DocumentClient.GetItemOutput = await documentClient
//     .get(gameQuery)
//     .promise();

//   if (!gameResult.Item) {
//     return null;
//   }

//   return gameResult.Item as dynamoGameItem;
// }
