import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { getInprogressGamesService } from "../services/gamePlayService/getInprogressGames";
import * as JSend from "../utils/jSendResponse";

export async function getGames(
  _: APIGatewayEvent,
  __: Context
): Promise<JSendResponseWrapper> {
  try {
    const gameIds: string[] = await getInprogressGamesService();
    if (!gameIds.length) {
      return JSend.error(
        ErrorMessages.GamesNotFound,
        null,
        StatusCodes.NOT_FOUND
      );
    }

    return JSend.success({ games: gameIds }, StatusCodes.OK);
  } catch (error) {
    console.log("Error in getGame: ", error);
    return JSend.error(
      ErrorMessages.InternalServerError,
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
