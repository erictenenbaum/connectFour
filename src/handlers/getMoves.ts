import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { getMovesByGameIdResponse } from "../interfaces/move";
import { getMovesByGameIdService } from "../services/gamePlayService/getMovesByGameIdService";
import * as JSend from "../utils/jSendResponse";

export async function getMoves(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  if (!event.pathParameters || !event.pathParameters.gameId) {
    return JSend.error(ErrorMessages.MalformedRequest, StatusCodes.BAD_REQUEST);
  }

  try {
    const getMovesByGameIdResponse: getMovesByGameIdResponse =
      await getMovesByGameIdService(event.pathParameters.gameId);

    return JSend.success(getMovesByGameIdResponse, StatusCodes.OK);
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
