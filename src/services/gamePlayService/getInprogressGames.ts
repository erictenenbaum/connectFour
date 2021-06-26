import { getInprogressGames } from "../../models";

export async function getInprogressGamesService(): Promise<string[]> {
  try {
    const inProgressGames: string[] = await getInprogressGames();
    return inProgressGames;
  } catch (error) {
    console.log("ERROR: ", error);
    throw new Error();
  }
}
