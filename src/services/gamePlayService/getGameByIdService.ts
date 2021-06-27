import { ErrorMessages } from "../../constants";
import { dynamoGameItem, getGameByIdResponse } from "../../interfaces";
import { getDynamoGameItem } from "../../models";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getGameByIdService(
  gameId: string
): Promise<getGameByIdResponse> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Game by Game Id - Service",
  });
  logger.info({ gameId }, "gameId - Service Layer");
  try {
    const game: dynamoGameItem | null = await getDynamoGameItem(gameId);
    if (!game) {
      logger.info("Game Not Found");
      throw Error(ErrorMessages.GameMovesNotFound);
    }

    const response: getGameByIdResponse = {
      players: game.game_initial_players,
      state: game.game_state ? "IN_PROGRESS" : "DONE",
    };

    if (game.winner || game.winner === "") {
      response.winner = game.winner ? game.winner : null;
    }

    logger.info({ response }, `Game ${gameId} Service Layer Response`);
    return response;
  } catch (error) {
    logger.info({ err: error }, "Error in Get Game By Id Service");
    throw error;
  }
}
