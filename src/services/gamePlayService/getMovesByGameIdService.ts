import { ErrorMessages } from "../../constants";
import { dynamoMoveItem } from "../../interfaces";
import {
  getMovesByGameIdResponse,
  moveResponseItem,
  quitResponseItem,
} from "../../interfaces/move";
import { getMovesByGameId } from "../../models";

export async function getMovesByGameIdService(
  gameId: string,
  range?: { start?: number; until?: number }
): Promise<getMovesByGameIdResponse> {
  try {
    const dynamoMoveItems: dynamoMoveItem[] = await getMovesByGameId(
      gameId,
      range
    );

    if (!dynamoMoveItems.length) {
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

    return getMovesByGameIdResponse;
  } catch (error) {
    throw error;
  }
}
