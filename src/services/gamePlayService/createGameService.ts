import {
  createGameRequest,
  dynamoGameItem,
  game,
  gameState,
  GAME_DETAILS,
} from "../../interfaces";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName, winSpaces } from "../../config";
import { v4 as uuidv4 } from "uuid";
import { ErrorMessages } from "../../constants";
import { documentClient } from "../../utils/dynamo";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function createGameService(
  createGameRequest: createGameRequest
): Promise<game> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Create Game - Service",
  });
  logger.info({ createGameRequest }, "Create Game Request - Service Layer");

  const gameId: string = uuidv4();
  const gameItem: dynamoGameItem = {
    pk: gameId,
    sk: GAME_DETAILS,
    game_players: createGameRequest.players,
    game_initial_players: createGameRequest.players,
    game_current_player: createGameRequest.players[0],
    game_played_moves: 0,
    game_state: gameState.inProgress,
    winSpaces,
    game_columns: createGameRequest.columns,
    game_rows: createGameRequest.rows,
  };

  const putItemInput: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: gameItem,
    ReturnValues: "ALL_OLD",
  };

  try {
    await documentClient.put(putItemInput).promise();
    return {
      gameId: gameId,
      players: createGameRequest.players,
      currentPlayer: createGameRequest.players[0],
      playedMoves: 0,
      gameState: gameState.inProgress,
      winSpaces: winSpaces,
      columns: createGameRequest.columns,
      rows: createGameRequest.rows,
    };
  } catch (error) {
    logger.info({ err: error }, "Error in Create Game Service");
    throw new Error(ErrorMessages.WriteRequestFailed);
  }
}
