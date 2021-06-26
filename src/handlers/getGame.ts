import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { getGameByIdResponse, JSendResponseWrapper } from "../interfaces";
import { getGameByIdService } from "../services/gamePlayService/getGameByIdService";
import * as JSend from "../utils/jSendResponse";

export async function getGame(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  try {
    if (!event.pathParameters || !event.pathParameters.gameId) {
      return JSend.error(
        ErrorMessages.MalformedRequest,
        StatusCodes.BAD_REQUEST
      );
    }

    const gameResponse: getGameByIdResponse = await getGameByIdService(
      event.pathParameters.gameId
    );
    return JSend.success(gameResponse, StatusCodes.OK);
  } catch (error) {
    if (error.message === ErrorMessages.GameMovesNotFound) {
      return JSend.error(
        ErrorMessages.GameMovesNotFound,
        StatusCodes.NOT_FOUND
      );
    }
    return JSend.error(
      ErrorMessages.InternalServerError,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}
