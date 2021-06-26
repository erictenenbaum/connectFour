import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../constants";
import { createMoveRequest, JSendResponseWrapper } from "../interfaces";
import { createMoveService } from "../services/gamePlayService/createMoveService";
import * as JSend from "../utils/jSendResponse";

export async function createMove(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  try {
    // validate user input
    const createMoveRequest: createMoveRequest | null =
      validateAndParseInput(event);

    if (!createMoveRequest) {
      return JSend.error(
        ErrorMessages.InvalidRequestBody,
        null,
        StatusCodes.BAD_REQUEST
      );
    }
    const createMoveResponse: string = await createMoveService(
      createMoveRequest
    );
    return JSend.success({ move: createMoveResponse });
  } catch (error) {
    return JSend.catchErrors(error);
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
