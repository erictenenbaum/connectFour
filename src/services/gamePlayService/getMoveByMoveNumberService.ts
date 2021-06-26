import { dynamoMoveItem } from "../../interfaces";
import { moveResponseItem } from "../../interfaces/move";
import { getMoveByMoveNumber } from "../../models";

export async function getMoveByMoveNumberService(
  gameId: string,
  moveNumber: number
): Promise<moveResponseItem> {
  try {
    const dynamoMoveItem: dynamoMoveItem = await getMoveByMoveNumber(
      gameId,
      moveNumber
    );

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
