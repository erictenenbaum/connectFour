export const tableName = process.env.tableName || "ConnectFour";

// Secondary Indexes:
export const pkMovePlayerIndex =
  process.env.pkMovePlayerIndex || "pk-move_player-index";
export const pkMoveColumnIndex =
  process.env.pkMoveColumnIndex || "pk-move_column-index";
export const gameStateIndex = process.env.gameStateIndex || "game_state-index";

// configurable game play options:
export const winSpaces: number = +(process.env.winSpaces as string) || 4;
