import { aws_lambda as lambda, Duration } from 'aws-cdk-lib';

// https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#events-sqs-queueconfig
function calcVisibilityTimeout(lambdaFn: lambda.Function) {
  const lambdaTimeoutSeconds = lambdaFn.timeout?.toSeconds() || 3;

  return Duration.seconds(6 * lambdaTimeoutSeconds);
}

export { calcVisibilityTimeout };
