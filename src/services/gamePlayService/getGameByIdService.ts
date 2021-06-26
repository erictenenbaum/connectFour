import { ErrorMessages } from "../../constants";
import { dynamoGameItem, getGameByIdResponse } from "../../interfaces";
import { getDynamoGameItem } from "../../models";

export async function getGameByIdService(
  gameId: string
): Promise<getGameByIdResponse> {
  try {
    const game: dynamoGameItem | null = await getDynamoGameItem(gameId);
    if (!game) {
      throw Error(ErrorMessages.GameMovesNotFound);
    }

    const response: getGameByIdResponse = {
      players: game.game_initial_players,
      state: game.game_state ? "IN_PROGRESS" : "DONE",
    };

    if (game.winner || game.winner === "") {
      response.winner = game.winner ? game.winner : null;
    }

    return response;
  } catch (error) {
    throw error;
  }
}
