export enum ErrorMessages {
  InternalServerError = "Internal Server Error",
  WriteRequestFailed = "Failed to write entity",
  MalformedRequest = "Malformed Request",
  GameMovesNotFound = "Game/Moves Not Found",
  GamesNotFound = "Game(s) Not Found",
  GameNotFoundOrPlayerNotPartOfIt = "Game not found or player is not a part of it.",
  NotPlayerTurn = "Player tried to post when it's not their turn.",
  IllegalMove = "Malformed Input/Illegal Move.",
  GameIsOver = "Game is already in DONE state.",
}
