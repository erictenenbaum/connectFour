import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { pkMovePlayerIndex, tableName } from "../../config";
import { dynamoMoveItem, move } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";

export async function getAllPlayerMoves(
  gameId: string,
  playerId: string
): Promise<move[]> {
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

  // Appeasing TypeScript with the Partial because it is not picking up that I am filtering out Quit Moves (Partials)
  const moves: Partial<move>[] = dynamoMoveItems
    .map((item: dynamoMoveItem) => {
      const move: Partial<move> = {
        gameId,
        playerId,
        moveNumber: Number.parseInt(item.sk.split("#")[1]),
      };

      if (item.move_column && item.move_row) {
        move.column = item.move_column;
        move.row = item.move_row;
      }

      return move;
    })
    // Quit moves will have a moveNumber value of 0, and no move.column and no move.row
    .filter((move: move) => move.moveNumber > 0 && move.column && move.row);
  return moves as move[];
}
