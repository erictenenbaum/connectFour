import * as BunyanLogger from "bunyan";
import { isNil, cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayEvent } from "aws-lambda";
import { JSendResponse } from "../../interfaces/jSendResponses";
import {
  LoggerConfig,
  RequestSerializer,
  ResponseSerializer,
} from "../../interfaces/logger";
import { LogLevelMapper } from "../../constants";

export default class Logger {
  private static instance: Logger;
  private bunyanLogger: BunyanLogger;

  constructor(transactionId: string, user: string) {
    const params: BunyanLogger.LoggerOptions = {
      name: "scheduler-api-service",
      level: Logger.getLogLevel(),
      transactionId: transactionId,
      user,
      serializers: {
        err: BunyanLogger.stdSerializers.err,
        req: Logger.requestSerializer,
        res: Logger.responseSerializer,
      },
      src: true,
    };

    // If LOG_PATH env variable set, set a file logger.
    if (process.env.LOG_PATH) {
      params.streams = [
        {
          level: (process.env.logLevel || "info") as BunyanLogger.LogLevel,
          stream: process.stdout,
        },
        {
          level: (process.env.logLevel || "info") as BunyanLogger.LogLevel,
          path: process.env.LOG_PATH,
        },
      ];
    }
    this.bunyanLogger = BunyanLogger.createLogger(params);
  }

  private static getLogLevel(): number {
    let level: number = LogLevelMapper.Info;

    if (!process.env.logLevel) {
      return level;
    } else {
      const levelInput = cloneDeep(process.env.logLevel);

      const pascalFormat = levelInput
        .toLocaleLowerCase()
        .replace(/(\w)(\w*)/g, (g0, g1, g2) => {
          return g1.toUpperCase() + g2.toLowerCase();
        });
      level = LogLevelMapper[pascalFormat];
    }

    return level;
  }

  public static getLogger(config: LoggerConfig): BunyanLogger {
    if (!Logger.instance) {
      Logger.instance = new Logger(
        config?.transactionId || uuidv4(),
        config?.user || ""
      );
    }
    if (!isNil(config?.logGroup)) {
      return Logger.instance.bunyanLogger.child({ logGroup: config?.logGroup });
    }

    return Logger.instance.bunyanLogger;
  }

  private static requestSerializer(req: APIGatewayEvent): RequestSerializer {
    const headers = cloneDeep(req?.headers);
    if (headers && ["x-api-key"]) {
      delete headers["x-api-key"];
    }
    return {
      body: req?.body,
      method: req?.httpMethod,
      path: req?.path,
      pathParameters: req?.pathParameters,
      queryStringParameters: req?.queryStringParameters,
      headers,
      requestId: req?.requestContext?.requestId,
      stage: req?.requestContext?.stage,
    };
  }

  private static responseSerializer(res: {
    statusCode: number;
    body: JSendResponse;
  }): ResponseSerializer {
    return res;
  }
}
