import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoMoveItem } from "../../interfaces";
import { documentClient } from "../../utils/dynamo";

export async function dynamoMoveItemQuery(
  query: DocumentClient.QueryInput
): Promise<dynamoMoveItem[]> {
  let dynamoMoveItemResult: DocumentClient.QueryOutput = await documentClient
    .query(query)
    .promise();

  if (dynamoMoveItemResult.Items) {
    let dynamoMoveItems: dynamoMoveItem[] =
      dynamoMoveItemResult.Items as dynamoMoveItem[];

    while (dynamoMoveItemResult.LastEvaluatedKey) {
      let dynamoMoveItemResult: DocumentClient.QueryOutput =
        await documentClient.query(query).promise();

      if (dynamoMoveItemResult.Items) {
        dynamoMoveItems = [
          ...dynamoMoveItems,
          ...(dynamoMoveItemResult.Items as dynamoMoveItem[]),
        ];
      }
    }
    return dynamoMoveItems;
  }
  return [];
}
