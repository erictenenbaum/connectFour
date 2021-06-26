export interface move {
  gameId: string;
  playerId: string;
  moveNumber: number;
  column: number;
  row: number;
}

export interface createMoveRequest {
  gameId: string;
  playerId: string;
  column: number;
}

export interface createMoveResponse {
  move: string;
}

export interface dynamoMoveItem {
  pk: string;
  sk: `${string}#${string}`;
  move_player: string;
  move_column: number;
  move_row: number;
}

export type moveResponseItem = {
  type: "MOVE";
  player: string;
  column: number;
};

export type quitResponseItem = {
  type: "QUIT";
  player: string;
};

export interface getMovesByGameIdResponse {
  moves: (moveResponseItem | quitResponseItem)[];
}
