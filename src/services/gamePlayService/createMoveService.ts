import { createMoveRequest, dynamoGameItem, move } from "../../interfaces";
import { checkWin } from "../checkWinService";
import {
  getDynamoGameItem,
  getAllPlayerMoves,
  getLastRowInColumn,
  updateGameAndWriteMove,
} from "../../models";
import { ErrorMessages } from "../../constants";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function createMoveService(
  createMoveRequest: createMoveRequest
): Promise<string> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Create Move - Service",
  });
  logger.info({ createMoveRequest }, "Create Move Request - Service Layer");

  try {
    const { gameId, playerId, column } = createMoveRequest;
    const dynamoGameItem: dynamoGameItem | null = await getDynamoGameItem(
      gameId
    );
    logger.info(
      { game: dynamoGameItem },
      "Game we are adding a move to - Service"
    );

    if (!dynamoGameItem) {
      logger.info("Game Not Found - Service");
      throw new Error(ErrorMessages.GameMovesNotFound);
    }

    if (!isLegalMove(playerId, column, dynamoGameItem)) {
      logger.info("Illegal Move - Service");
      throw new Error(ErrorMessages.IllegalMove);
    }

    if (dynamoGameItem.game_current_player !== playerId) {
      logger.info("Not Player's Turn - Service");
      throw new Error(ErrorMessages.NotPlayerTurn);
    }

    const lastRowInColumn: number = await getLastRowInColumn(gameId, column);
    if (lastRowInColumn === dynamoGameItem.game_rows) {
      logger.info("Illegal Move - Not enough space in collumm to make move");
      throw new Error(ErrorMessages.IllegalMove);
    }

    // get all moves by this player (plus current move) to check if they won, or game ended in a tie, then write to DB:
    const moves: move[] = await getAllPlayerMoves(gameId, playerId);

    const currentMove: move = {
      gameId,
      playerId,
      column,
      moveNumber: dynamoGameItem.game_played_moves + 1,
      row: lastRowInColumn + 1,
    };
    moves.push(currentMove);
    logger.info(
      { moves },
      `All Moves (including current move) for Player: ${playerId}`
    );

    // check if they've won
    if (
      moves.length + 1 >= dynamoGameItem.winSpaces &&
      checkWin(moves, dynamoGameItem.winSpaces)
    ) {
      logger.info(`Player ${playerId} won the game ${gameId}`);
      return await updateGameAndWriteMove(
        currentMove,
        dynamoGameItem,
        true,
        true
      );
    }

    // check tie:
    if (
      dynamoGameItem.game_played_moves + 1 ===
      dynamoGameItem.game_columns * dynamoGameItem.game_rows
    ) {
      logger.info(`Game ${gameId} ends in a tie`);
      return await updateGameAndWriteMove(
        currentMove,
        dynamoGameItem,
        true,
        false
      );
    }

    // write move:
    logger.info("No win or tie - Update Game and Write Move");
    return await updateGameAndWriteMove(currentMove, dynamoGameItem, false);
  } catch (error) {
    throw error;
  }
}

function isLegalMove(
  playerId: string,
  column: number,
  dynamoGameItem: dynamoGameItem
): boolean {
  // game_state is a sparse index - so it will either exist (with a value of 1) or the field will not be present.
  if (!dynamoGameItem.game_state) {
    return false;
  }

  if (!dynamoGameItem.game_players.includes(playerId)) {
    return false;
  }

  if (column > dynamoGameItem.game_columns) {
    return false;
  }

  return true;
}
