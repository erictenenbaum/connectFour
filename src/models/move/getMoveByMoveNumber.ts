import { documentClient } from "../../utils/dynamo";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { tableName } from "../../config";
import { dynamoMoveItem } from "../../interfaces/move";
import { ErrorMessages } from "../../constants";

export async function getMoveByMoveNumber(
  gameId: string,
  moveNumber: number
): Promise<dynamoMoveItem> {
  const getItemInput: DocumentClient.GetItemInput = {
    TableName: tableName,
    Key: {
      pk: gameId,
      sk: `MOVE#${moveNumber}`,
    },
  };

  try {
    const getItemOutput: DocumentClient.GetItemOutput = await documentClient
      .get(getItemInput)
      .promise();

    if (!getItemOutput.Item) {
      throw new Error(ErrorMessages.GameMovesNotFound);
    }

    return getItemOutput.Item as dynamoMoveItem;
  } catch (error) {
    throw error;
  }
}
