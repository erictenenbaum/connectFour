import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { removePlayerService } from "../services/gamePlayService/removePlayerService";
import * as JSend from "../utils/jSendResponse";

export async function removePlayer(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  try {
    if (
      !event.pathParameters ||
      !event.pathParameters.gameId ||
      !event.pathParameters.playerId
    ) {
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    await removePlayerService(
      event.pathParameters.gameId,
      event.pathParameters.playerId
    );
    return JSend.success(null, StatusCodes.ACCEPTED);
  } catch (error) {
    if (error.message === ErrorMessages.GameMovesNotFound) {
      return JSend.error(
        ErrorMessages.GameMovesNotFound,
        null,
        StatusCodes.NOT_FOUND
      );
    }

    if (error.message === ErrorMessages.GameIsOver) {
      return JSend.error(ErrorMessages.GameIsOver, null, StatusCodes.GONE);
    }
    return JSend.error(
      ErrorMessages.InternalServerError,
      null,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
