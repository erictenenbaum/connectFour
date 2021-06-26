import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { JSendResponseWrapper } from "../interfaces";
import { moveResponseItem } from "../interfaces/move";
import { getMoveByMoveNumberService } from "../services/gamePlayService/getMoveByMoveNumberService";
import * as JSend from "../utils/jSendResponse";

export async function getMove(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
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
    return JSend.success(moveResponseItem, StatusCodes.OK);
  } catch (error) {
    console.log("Error in getMove: ", error);
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
