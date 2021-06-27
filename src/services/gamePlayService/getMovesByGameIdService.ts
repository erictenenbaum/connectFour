import { ErrorMessages } from "../../constants";
import { dynamoMoveItem } from "../../interfaces";
import {
  getMovesByGameIdResponse,
  moveResponseItem,
  quitResponseItem,
} from "../../interfaces/move";
import { getMovesByGameId } from "../../models";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getMovesByGameIdService(
  gameId: string,
  range?: { start?: number; until?: number }
): Promise<getMovesByGameIdResponse> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Moves By Game Id (Get Moves) - Service",
  });
  logger.info(
    { gameId, range },
    "gameId and optional range param (might be undefined) - Service Layer"
  );
  try {
    const dynamoMoveItems: dynamoMoveItem[] = await getMovesByGameId(
      gameId,
      range
    );
    logger.info({ moves: dynamoMoveItems }, "Moves");

    if (!dynamoMoveItems.length) {
      logger.debug("No Moves Found");
      throw new Error(ErrorMessages.GameMovesNotFound);
    }

    const getMovesByGameIdResponseArray: (
      | quitResponseItem
      | moveResponseItem
    )[] = dynamoMoveItems.map((dynamoMoveItem: dynamoMoveItem) => {
      if (Number.parseInt(dynamoMoveItem.sk.split("#")[1]) === 0) {
        const quitResponseItem: quitResponseItem = {
          type: "QUIT",
          player: dynamoMoveItem.move_player,
        };
        return quitResponseItem;
      }

      const moveResponseItem: moveResponseItem = {
        type: "MOVE",
        player: dynamoMoveItem.move_player,
        column: dynamoMoveItem.move_column,
      };

      return moveResponseItem;
    });

    const getMovesByGameIdResponse: getMovesByGameIdResponse = {
      moves: getMovesByGameIdResponseArray,
    };
    logger.info(
      { movesResponse: getMovesByGameIdResponse },
      "Service Response"
    );

    return getMovesByGameIdResponse;
  } catch (error) {
    logger.debug({ err: error }, "Error in Get Moves Service");
    throw error;
  }
}
