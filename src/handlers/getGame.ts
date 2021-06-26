import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { getGameByIdResponse, JSendResponseWrapper } from "../interfaces";
import { getGameByIdService } from "../services/gamePlayService/getGameByIdService";
import * as JSend from "../utils/jSendResponse";

export async function getGame(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  try {
    if (!event.pathParameters || !event.pathParameters.gameId) {
      throw new Error("malformed");
    }

    const gameResponse: getGameByIdResponse = await getGameByIdService(
      event.pathParameters.gameId
    );
    return JSend.success(gameResponse, StatusCodes.OK);
  } catch (error) {
    return JSend.catchErrors(error);
  }
}
