import { getDynamoGameItem, updateGameAndWriteQuitMove } from "../../models";
import { dynamoGameItem } from "../../interfaces";
import { ErrorMessages } from "../../constants";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function removePlayerService(
  gameId: string,
  playerId: string
): Promise<void> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Remove Player - Service",
  });
  logger.info({ gameId, playerId }, "gameId, playerId - Service Layer");
  const dynamoGameItem: dynamoGameItem | null = await getDynamoGameItem(gameId);

  if (!dynamoGameItem || !dynamoGameItem.game_players.includes(playerId)) {
    logger.debug("Game or Player Not Found");
    throw Error(ErrorMessages.GameMovesNotFound);
  }

  // sparse index - game state will only exist on "in progress" games
  if (!dynamoGameItem.game_state) {
    logger.debug("Game is Over - Cannot Remove Player from DONE game");
    throw Error(ErrorMessages.GameIsOver);
  }

  await updateGameAndWriteQuitMove(dynamoGameItem, playerId);
  return;
}
