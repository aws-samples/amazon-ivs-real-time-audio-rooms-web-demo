import { ARN, parse } from '@aws-sdk/util-arn-parser';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import pRetry, { Options as PRetryOptions } from 'p-retry';

const DEFAULT_RESPONSE_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

class ResponseError extends Error {
  public readonly code;

  constructor(
    code = 500,
    name = 'UnexpectedError',
    message = 'Unexpected error occurred'
  ) {
    super(message);
    this.code = code;
    this.name = name;
  }
}

function createSuccessResponse({
  body = {},
  code = 200
}: {
  body?: object | string;
  code?: number;
} = {}): APIGatewayProxyResultV2 {
  return {
    statusCode: code,
    headers: DEFAULT_RESPONSE_HEADERS,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

function createErrorResponse({
  code = 500,
  name,
  message,
  error
}: {
  code?: number;
  name?: string;
  message?: string;
  error?: unknown;
} = {}): APIGatewayProxyResultV2 {
  const responseError = error || new ResponseError(code, name, message);

  return {
    statusCode: code,
    headers: DEFAULT_RESPONSE_HEADERS,
    body: JSON.stringify(
      responseError,
      Object.getOwnPropertyNames(responseError).filter((key) => key !== 'stack')
    )
  };
}

function parseArn(
  arn: string
): ARN & { resourceId: string; resourceType: string } {
  const result = parse(arn);
  const [resourceType, resourceId] = result.resource.split('/');

  return { ...result, resourceType, resourceId };
}

function getElapsedTimeInSeconds(fromDate: string) {
  if (!fromDate) return 0;

  const elapsedTimeMs = Date.now() - new Date(fromDate).getTime();
  const elapsedTimeSeconds = elapsedTimeMs / 1000;

  return elapsedTimeSeconds;
}

function retryWithBackoff<T>(
  promiseFn: () => Promise<T>,
  options?: PRetryOptions
) {
  /**
   * A factor of 1.5707 ensures that 5 retry attempts are made within a period of
   * 15 seconds (random = 1) to 30 seconds (random = 2).
   *
   * Calculation: https://www.wolframalpha.com/input?i=Sum%5B1000*x%5Ek%2C+%7Bk%2C+0%2C+4%7D%5D+%3D+15+*+1000
   */
  const defaultRetryOptions: PRetryOptions = {
    retries: 5,
    factor: 1.5707,
    minTimeout: 1000,
    maxTimeout: Infinity,
    randomize: true, // random = 1 to 2
    onFailedAttempt: (error) => {
      // Only retry the request if TooManyRequestsException was thrown
      if (error.name !== 'TooManyRequestsException') {
        throw error;
      }
    }
  };

  return pRetry(promiseFn, { ...defaultRetryOptions, ...options });
}

function createRoomIdFromStageArn(stageArn: string) {
  return parseArn(stageArn).resourceId;
}

export {
  createErrorResponse,
  createRoomIdFromStageArn,
  createSuccessResponse,
  getElapsedTimeInSeconds,
  parseArn,
  retryWithBackoff
};