import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { createMoveRequest, JSendResponseWrapper } from "../interfaces";
import { createMoveService } from "../services/gamePlayService/createMoveService";
import * as JSend from "../utils/jSendResponse";
import * as BunyanLogger from "bunyan";
import Logger from "../utils/logger/logger";

export async function createMove(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Create Move - Handler",
  });
  logger.info({ event }, "APIGateway Event");
  try {
    // validate user input
    const createMoveRequest: createMoveRequest | null =
      validateAndParseInput(event);

    if (!createMoveRequest) {
      logger.debug(
        { createMoveRequest },
        "create move request didn't pass validation"
      );
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    const createMoveResponse: string = await createMoveService(
      createMoveRequest
    );
    logger.info({ createMoveRequest }, "successfully created move");
    return JSend.success({ move: createMoveResponse });
  } catch (error) {
    logger.debug({ err: error }, "Error caught in create move handler");
    switch (error.message) {
      case ErrorMessages.GameMovesNotFound:
        return JSend.error(
          ErrorMessages.GameMovesNotFound,
          null,
          StatusCodes.NOT_FOUND
        );

      case ErrorMessages.IllegalMove:
        return JSend.error(
          ErrorMessages.IllegalMove,
          null,
          StatusCodes.BAD_REQUEST
        );

      case ErrorMessages.NotPlayerTurn:
        return JSend.error(
          ErrorMessages.NotPlayerTurn,
          null,
          StatusCodes.CONFLICT
        );

      default:
        return JSend.error(
          ErrorMessages.InternalServerError,
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
  }
}

function validateAndParseInput(
  event: APIGatewayEvent
): createMoveRequest | null {
  // checking body and mostly appeasing TypeScript null checking
  if (
    event.body &&
    JSON.parse(event.body).column &&
    Number.isInteger(JSON.parse(event.body).column) &&
    event.pathParameters &&
    event.pathParameters.gameId &&
    event.pathParameters.playerId
  ) {
    const createMoveRequest: createMoveRequest = {
      gameId: event.pathParameters.gameId,
      playerId: event.pathParameters.playerId,
      column: JSON.parse(event.body).column,
    };

    return createMoveRequest;
  }
  return null;
}
