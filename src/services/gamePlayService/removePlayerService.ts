import { getDynamoGameItem, updateGameAndWriteQuitMove } from "../../models";
import { dynamoGameItem } from "../../interfaces";
import { ErrorMessages } from "../../constants";

export async function removePlayerService(
  gameId: string,
  playerId: string
): Promise<void> {
  const dynamoGameItem: dynamoGameItem | null = await getDynamoGameItem(gameId);

  if (!dynamoGameItem || !dynamoGameItem.game_players.includes(playerId)) {
    throw Error(ErrorMessages.GameMovesNotFound);
  }

  // sparse index - game state will only exist on "in progress" games
  if (!dynamoGameItem.game_state) {
    throw Error(ErrorMessages.GameIsOver);
  }

  await updateGameAndWriteQuitMove(dynamoGameItem, playerId);
  return;
}
