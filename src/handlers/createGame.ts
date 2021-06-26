import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { createGameRequest, game, JSendResponseWrapper } from "../interfaces";
import { createGameService } from "../services/gamePlayService/createGameService";
import * as JSend from "../utils/jSendResponse";
import { isValidateCreateGameRequest } from "../utils/validateRequest";

export async function createGame(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
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
      return JSend.error(
        ErrorMessages.MalformedRequest,
        null,
        StatusCodes.BAD_REQUEST
      );
    }

    const createdGame: game = await createGameService(createGameRequest);
    return JSend.success(createdGame);
  } catch (error) {
    return JSend.error(ErrorMessages.InternalServerError);
  }
}
