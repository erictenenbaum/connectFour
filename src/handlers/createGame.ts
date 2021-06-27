import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { createGameRequest, game, JSendResponseWrapper } from "../interfaces";
import { createGameService } from "../services/gamePlayService/createGameService";
import * as JSend from "../utils/jSendResponse";
import { isValidateCreateGameRequest } from "../utils/validateRequest";
import * as BunyanLogger from "bunyan";
import Logger from "../utils/logger/logger";

export async function createGame(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Create Game - Handler",
  });
  logger.info({ event }, "APIGateway Event");

  try {
    if (!event.body) {
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    // validate incoming create game request:
    const createGameRequest: createGameRequest = JSON.parse(event.body);
    if (
      !createGameRequest.players ||
      !createGameRequest.columns ||
      !createGameRequest.rows ||
      !isValidateCreateGameRequest(createGameRequest)
    ) {
      logger.debug(
        { createGameRequest },
        "create game request didn't pass validation"
      );
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const createdGame: game = await createGameService(createGameRequest);
    logger.info({ createdGame }, "successfully created game");
    return JSend.success(createdGame);
  } catch (error) {
    logger.debug({ err: error }, "Error caught in create game handler");
    return JSend.error(ErrorMessages.InternalServerError);
  }
}
