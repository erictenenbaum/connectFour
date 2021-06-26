import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { JSendResponseWrapper } from "../interfaces";
import { getMovesByGameIdResponse } from "../interfaces/move";
import { getMovesByGameIdService } from "../services/gamePlayService/getMovesByGameIdService";
import * as JSend from "../utils/jSendResponse";

export async function getMoves(
  event: APIGatewayEvent,
  _: Context
): Promise<JSendResponseWrapper> {
  if (!event.pathParameters || !event.pathParameters.gameId) {
    throw new Error("400");
  }
  try {
    const getMovesByGameIdResponse: getMovesByGameIdResponse =
      await getMovesByGameIdService(event.pathParameters.gameId);
    return JSend.success(getMovesByGameIdResponse, StatusCodes.OK);
  } catch (error) {
    return JSend.catchErrors(error);
  }
}
