import { documentClient } from "../../utils/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { gameStateIndex, tableName } from "../../config";
import { dynamoGameItem, gameState } from "../../interfaces";

export async function getInprogressGamesService(): Promise<string[]> {
  const queryInput: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: gameStateIndex,
    KeyConditionExpression: "game_state = :gs",
    ExpressionAttributeValues: {
      ":gs": 1,
    },
  };

  try {
    const queryOutput: DocumentClient.QueryOutput = await documentClient
      .query(queryInput)
      .promise();

    return queryOutput.Items
      ? queryOutput.Items.map((item: Partial<dynamoGameItem>) => item.pk!)
      : [];
  } catch (error) {
    console.log("ERROR: ", error);
    throw new Error();
  }
}
