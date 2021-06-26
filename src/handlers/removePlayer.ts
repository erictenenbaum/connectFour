import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
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
      throw Error();
    }
    await removePlayerService(
      event.pathParameters.gameId,
      event.pathParameters.playerId
    );
    return JSend.success(null, StatusCodes.ACCEPTED);
  } catch (error) {
    return JSend.catchErrors(error);
  }
}
