import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { moveResponseItem } from "../interfaces/move";
import { getMoveByMoveNumberService } from "../services/gamePlayService/getMoveByMoveNumberService";
import * as JSend from "../utils/jSendResponse";
import * as BunyanLogger from "bunyan";
import Logger from "../utils/logger/logger";

export async function getMove(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get Move - Handler",
  });
  logger.info({ event }, "APIGateway Event");
  try {
    if (
      !event.pathParameters ||
      !event.pathParameters.gameId ||
      !event.pathParameters.move_number
    ) {
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const moveResponseItem: moveResponseItem = await getMoveByMoveNumberService(
      event.pathParameters.gameId,
      Number.parseInt(event.pathParameters.move_number)
    );
    logger.info({ moveResponseItem }, "successful Get Move");
    return JSend.success(moveResponseItem, StatusCodes.OK);
  } catch (error) {
    logger.debug({ err: error }, "Error in Get Move Handler");
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
