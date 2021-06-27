import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { pkMovePlayerIndex, tableName } from "../../config";
import { dynamoMoveItem, move } from "../../interfaces";
import { dynamoMoveItemQuery } from "./dynamoMoveItemQuery";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getAllPlayerMoves(
  gameId: string,
  playerId: string
): Promise<move[]> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get All Player Moves (Get Moves) - Model",
  });
  logger.info({ gameId, playerId }, "gameId, playerId - Model");

  const movePlayerQuery: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: pkMovePlayerIndex,
    KeyConditionExpression: "pk = :pk AND move_player = :mp",
    ExpressionAttributeValues: {
      ":pk": gameId,
      ":mp": playerId,
    },
  };

  logger.info({ query: movePlayerQuery }, "Query");

  let dynamoMoveItems: dynamoMoveItem[] = await dynamoMoveItemQuery(
    movePlayerQuery
  );

  logger.info({ result: dynamoMoveItems }, "Dynamo Result");

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
