import { getInprogressGames } from "../../models";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function getInprogressGamesService(): Promise<string[]> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup: "Get In Progress Games - Service",
  });
  logger.info("Get In Progress Games - Service Layer");
  try {
    const inProgressGames: string[] = await getInprogressGames();
    logger.info({ inProgressGames }, "In Progress Games");
    return inProgressGames;
  } catch (error) {
    logger.debug({ err: error }, "Error in Get In Progress Games Service");
    throw error;
  }
}
