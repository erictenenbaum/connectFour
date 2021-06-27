import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { getGameByIdResponse, JSendResponseWrapper } from "../interfaces";
import { getGameByIdService } from "../services/gamePlayService/getGameByIdService";
import * as JSend from "../utils/jSendResponse";
import * as BunyanLogger from "bunyan";
import Logger from "../utils/logger/logger";

export async function getGame(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Move - Handler",
  });
  logger.info({ event }, "APIGateway Event");

  try {
    if (!event.pathParameters || !event.pathParameters.gameId) {
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const gameResponse: getGameByIdResponse = await getGameByIdService(
      event.pathParameters.gameId
    );
    logger.info({ gameResponse }, "successful Get Move");
    return JSend.success(gameResponse, StatusCodes.OK);
  } catch (error) {
    logger.info({ err: error }, "Error caught in Get Move Handler");
    if (error.message === ErrorMessages.GameMovesNotFound) {
      return JSend.error(
        ErrorMessages.GameMovesNotFound,
        null,
        StatusCodes.NOT_FOUND
      );
    }
    return JSend.error(
      ErrorMessages.InternalServerError,
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
