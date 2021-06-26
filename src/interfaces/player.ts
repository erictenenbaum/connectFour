import { move } from "./move";

export interface player {
  gameId: string;
  playerId: string;
  moves: move[];
  quit?: boolean;
}
