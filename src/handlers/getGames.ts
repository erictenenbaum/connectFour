import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { getInprogressGamesService } from "../services/gamePlayService/getInprogressGames";
import * as JSend from "../utils/jSendResponse";
import * as BunyanLogger from "bunyan";
import Logger from "../utils/logger/logger";

export async function getGames(
  event: APIGatewayEvent,
  __: Context
): Promise<JSendResponseWrapper> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Games - Handler",
  });
  logger.info({ event }, "APIGateway Event");
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
    logger.debug({ err: error }, "Error in Get Games Handler");
    return JSend.error(
      ErrorMessages.InternalServerError,
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
