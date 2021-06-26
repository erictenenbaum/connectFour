import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName, gameStateIndex } from "../../config";
import { dynamoGameItem } from "../../interfaces";
import { documentClient } from "../../utils/dynamo";

export async function getInprogressGames(): Promise<string[]> {
  const queryInput: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: gameStateIndex,
    KeyConditionExpression: "game_state = :gs",
    ExpressionAttributeValues: {
      ":gs": 1,
    },
  };

  const queryOutput: DocumentClient.QueryOutput = await documentClient
    .query(queryInput)
    .promise();

  return queryOutput.Items
    ? queryOutput.Items.map((item: Partial<dynamoGameItem>) => item.pk!)
    : [];
}
