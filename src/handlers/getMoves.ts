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
    const range: { start?: number; until?: number } = {};
    if (
      event.queryStringParameters &&
      event.queryStringParameters.start &&
      Number.isInteger(Number.parseInt(event.queryStringParameters.start))
    ) {
      range.start = Number.parseInt(event.queryStringParameters.start);
    }

    if (
      event.queryStringParameters &&
      event.queryStringParameters.until &&
      Number.isInteger(Number.parseInt(event.queryStringParameters.until))
    ) {
      range.until = Number.parseInt(event.queryStringParameters.until);
    }

    const getMovesByGameIdResponse: getMovesByGameIdResponse =
      await getMovesByGameIdService(
        event.pathParameters.gameId,
        range.start || range.until ? range : undefined
      );

    return JSend.success(getMovesByGameIdResponse, StatusCodes.OK);
  } catch (error) {
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
