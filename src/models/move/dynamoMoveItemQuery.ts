import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { dynamoMoveItem } from "../../interfaces";
import { documentClient } from "../../utils/dynamo";
import * as BunyanLogger from "bunyan";
import Logger from "../../utils/logger/logger";

export async function dynamoMoveItemQuery(
  query: DocumentClient.QueryInput
): Promise<dynamoMoveItem[]> {
  const logger: BunyanLogger = Logger.getLogger({
    logGroup:
      "Generic Dynamo Move Query (for potentially large requests) - Model",
  });
  logger.info({ query }, "Query - Model");

  let dynamoMoveItemResult: DocumentClient.QueryOutput = await documentClient
    .query(query)
    .promise();

  logger.info({ initialResults: dynamoMoveItemResult }, "initial results");

  if (dynamoMoveItemResult.Items) {
    let dynamoMoveItems: dynamoMoveItem[] =
      dynamoMoveItemResult.Items as dynamoMoveItem[];

    while (dynamoMoveItemResult.LastEvaluatedKey) {
      logger.info(
        { LastEvaluatedKey: dynamoMoveItemResult.LastEvaluatedKey },
        "Last Evaluated Key Found - Make another trip to the DB"
      );
      dynamoMoveItemResult = await documentClient.query(query).promise();

      if (dynamoMoveItemResult.Items) {
        dynamoMoveItems = [
          ...dynamoMoveItems,
          ...(dynamoMoveItemResult.Items as dynamoMoveItem[]),
        ];
      }
    }
    logger.info({ allMoves: dynamoMoveItems }, "All Moves");
    return dynamoMoveItems;
  }
  return [];
}
