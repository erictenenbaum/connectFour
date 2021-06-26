import { createGameRequest } from "../../interfaces";

export function isValidateCreateGameRequest(
  creatGameReques: createGameRequest
) {
  // not adding constraints on minimum columns or rows, this could be changed to min of 4:
  if (
    !Number.isInteger(creatGameReques.columns) ||
    !Number.isInteger(creatGameReques.rows)
  ) {
    return false;
  }

  // All players must be unique, and there must be at least two valid players:
  // TODO: filter out empty strings
  const playerSet: Set<string> = new Set(creatGameReques.players);
  if (playerSet.size !== creatGameReques.players.length || playerSet.size < 2) {
    return false;
  }

  return true;
}
