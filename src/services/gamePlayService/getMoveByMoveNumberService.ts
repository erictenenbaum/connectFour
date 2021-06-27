import { dynamoMoveItem } from "../../interfaces";
import { moveResponseItem } from "../../interfaces/move";
import { getMoveByMoveNumber } from "../../models";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getMoveByMoveNumberService(
  gameId: string,
  moveNumber: number
): Promise<moveResponseItem> {
  try {
    const logger: BunyanLogger = Logger.getLogger({
      logGroup: "Get Move By Move Number (Get Move) - Service",
    });
    logger.info(
      { gameId, moveNumber },
      "gameId and moveNumber - Service Layer"
    );
    const dynamoMoveItem: dynamoMoveItem = await getMoveByMoveNumber(
      gameId,
      moveNumber
    );
    logger.info({ move: dynamoMoveItem }, "Move");

    const moveResponseItem: moveResponseItem = {
      type: "MOVE",
      player: dynamoMoveItem.move_player,
      column: dynamoMoveItem.move_column,
    };

    return moveResponseItem;
  } catch (error) {
    throw error;
  }
}
