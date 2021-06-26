import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
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
      throw new Error("400");
    }

    const moveResponseItem: moveResponseItem = await getMoveByMoveNumberService(
      event.pathParameters.gameId,
      Number.parseInt(event.pathParameters.move_number)
    );
    return JSend.success(moveResponseItem, StatusCodes.OK);
  } catch (error) {
    return JSend.catchErrors(error);
  }
}
