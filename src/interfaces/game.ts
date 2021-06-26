export enum gameState {
  inProgress = 1,
  done = 2,
}

export const GAME_DETAILS = "game_details";

export interface game {
  gameId: string;
  // Thought about making this a Set, but order / indexing will matter for determining which player's turn it is
  players: string[];
  //   maybe last player and last move_number:
  currentPlayer: string;
  playedMoves: number;

  gameState: gameState;
  columns: number;
  rows: number;
  winSpaces: number;
  winner?: string;
}

export interface createGameRequest {
  players: string[];
  columns: number;
  rows: number;
}

export interface dynamoGameItem {
  pk: string;
  sk: typeof GAME_DETAILS;
  game_players: string[];
  game_initial_players: string[];
  game_current_player: string;
  game_played_moves: number;
  game_state?: gameState;
  winSpaces: number;
  game_columns: number;
  game_rows: number;
  winner?: string;
}

export interface getGameByIdResponse {
  players: string[];
  state: "IN_PROGRESS" | "DONE";
  winner?: string | null;
}
