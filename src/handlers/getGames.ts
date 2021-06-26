import { APIGatewayEvent, Context } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { JSendResponseWrapper } from "../interfaces";
import { getInprogressGamesService } from "../services/gamePlayService/getInprogressGames";
import * as JSend from "../utils/jSendResponse";

export async function getGames(
  _: APIGatewayEvent,
  __: Context
): Promise<JSendResponseWrapper> {
  try {
    const gameIds: string[] = await getInprogressGamesService();
    return JSend.success({ games: gameIds }, StatusCodes.OK);
  } catch (error) {
    return JSend.catchErrors(error);
  }
}
