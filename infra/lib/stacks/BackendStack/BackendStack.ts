import {
  EnhancedLambdaFunction,
  EventScheduleRule,
  LambdaTrigger
} from '@Lib/constructs';
import {
  ivsCreateResourcesPolicy,
  ivsDeleteResourcesPolicy,
  ivsGetResourcesPolicy,
  ivsPublicKeyPolicy,
  ivsTagResourcesPolicy,
  kmsGenerateDataKeyPairPolicy
} from '@Lib/policies';
import {
  createExportName,
  createResourceName,
  getLambdaEntryPath
} from '@Lib/utils';
import { AppEnv } from '@Shared/types';
import {
  aws_apigateway as apigw,
  aws_dynamodb as ddb,
  aws_events as events,
  aws_events_targets as targets,
  aws_kms as kms,
  aws_lambda as lambda,
  aws_lambda_event_sources as eventSource,
  aws_logs as logs,
  aws_secretsmanager as sm,
  aws_sqs as sqs,
  aws_ssm as ssm,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { calcVisibilityTimeout } from './utils';

interface BackendStackProps extends StackProps {
  readonly appEnv: AppEnv;
}

class BackendStack extends Stack {
  readonly appEnv: AppEnv;

  readonly roomsTable: ddb.TableV2;

  readonly roomsApi: apigw.RestApi;

  readonly activeRoomIndexName = 'ActiveRoomsIndex';

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);
    this.appEnv = props.appEnv;

    this.roomsTable = new ddb.TableV2(this, 'RoomsTable', {
      tableName: createResourceName(this, 'RoomsTable'),
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billing: ddb.Billing.onDemand(),
      globalSecondaryIndexes: [
        {
          indexName: this.activeRoomIndexName,
          partitionKey: {
            name: 'activeSessionId',
            type: ddb.AttributeType.STRING
          },
          nonKeyAttributes: ['updatedAt', 'stageArn'],
          projectionType: ddb.ProjectionType.INCLUDE
        }
      ]
    });

    this.roomsApi = new apigw.RestApi(this, 'RoomsAPI', {
      restApiName: createResourceName(this, 'RoomsAPI'),
      endpointExportName: createExportName(this, 'apiUrl'),
      deployOptions: { stageName: this.appEnv },
      defaultCorsPreflightOptions: {
        allowMethods: ['GET', 'POST'],
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS
      }
    });

    const symmetricKey = new kms.Key(this, 'SymmetricEncryptionKey', {
      alias: createResourceName(this, 'SymmetricEncryptionKey'),
      enableKeyRotation: true,
      pendingWindow: Duration.days(7),
      keySpec: kms.KeySpec.SYMMETRIC_DEFAULT,
      keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
      removalPolicy: RemovalPolicy.DESTROY,
      description:
        'Symmetric encryption key used to rotate the ECDSA public/private key-pair used to create and verify stage participant tokens.'
    });

    const privateKeySecret = new sm.Secret(this, 'PrivateKey', {
      secretName: createResourceName(this, 'PrivateKey'),
      removalPolicy: RemovalPolicy.DESTROY,
      description:
        'Stores the PEM-formatted private key used to create stage participant tokens.'
    });

    const publicKeyArnParam = new ssm.StringParameter(this, 'PublicKeyArn', {
      tier: ssm.ParameterTier.STANDARD,
      dataType: ssm.ParameterDataType.TEXT,
      parameterName: `/${this.stackName}/publicKeyArn`,
      stringValue: JSON.stringify({ arn: '' }),
      description:
        'Stores the ARN of the imported public key used to verify stage participant tokens.'
    });

    const rotateKeyPairLambda = new EnhancedLambdaFunction(
      this,
      'RotateKeyPair',
      {
        environment: {
          ...this.commonEnv,
          SYMMETRIC_KEY_ARN: symmetricKey.keyArn,
          PRIVATE_KEY_SECRET_ARN: privateKeySecret.secretArn,
          PUBLIC_KEY_PREFIX: createResourceName(this, 'PublicKey'),
          PUBLIC_KEY_ARN_PARAM_NAME: publicKeyArnParam.parameterName
        },
        initialPolicy: [
          ivsPublicKeyPolicy,
          ivsTagResourcesPolicy,
          kmsGenerateDataKeyPairPolicy
        ],
        entry: getLambdaEntryPath('triggers/rotateKeyPair'),
        functionName: createResourceName(this, 'RotateKeyPair'),
        description:
          'Rotates the public-private key pair used to create and verify participant tokens'
      }
    );
    symmetricKey.grantDecrypt(rotateKeyPairLambda);
    privateKeySecret.grantRead(rotateKeyPairLambda);
    privateKeySecret.grantWrite(rotateKeyPairLambda);
    publicKeyArnParam.grantRead(rotateKeyPairLambda);
    publicKeyArnParam.grantWrite(rotateKeyPairLambda);

    // Trigger the RotateKeyPair Lambda function to initialize the public/private key-pair
    new LambdaTrigger(this, 'RotateKeyPairLambdaTrigger', rotateKeyPairLambda);

    // Join room
    const joinRoomLambda = new EnhancedLambdaFunction(this, 'JoinRoom', {
      initialPolicy: [ivsCreateResourcesPolicy, ivsTagResourcesPolicy],
      environment: {
        ...this.commonEnv,
        PRIVATE_KEY_SECRET_ARN: privateKeySecret.secretArn,
        PUBLIC_KEY_ARN_PARAM_NAME: publicKeyArnParam.parameterName
      },
      memorySize: 1769, // 1769 MB = 1 vCPU-second of credits per second
      entry: getLambdaEntryPath('api/joinRoom'),
      functionName: createResourceName(this, 'JoinRoom'),
      description: 'Joins an existing room or creates a new one'
    });
    const joinRoomAlias = joinRoomLambda.configureProvisionedConcurrency({
      minCapacity: this.isDev ? 1 : 10
    });
    this.addRoomAPILambdaProxy(joinRoomAlias, {
      httpMethod: 'POST',
      resourcePath: ['room', 'join']
    });
    privateKeySecret.grantRead(joinRoomLambda);
    publicKeyArnParam.grantRead(joinRoomLambda);
    this.roomsTable.grantReadWriteData(joinRoomLambda);

    // Get room
    const getRoomLambda = new EnhancedLambdaFunction(this, 'GetRoom', {
      environment: this.commonEnv,
      entry: getLambdaEntryPath('api/getRoom'),
      functionName: createResourceName(this, 'GetRoom'),
      description: 'Returns room data for a specified room ID'
    });
    const getRoomAlias = getRoomLambda.configureProvisionedConcurrency({
      minCapacity: this.isDev ? 1 : 10
    });
    this.addRoomAPILambdaProxy(getRoomAlias, {
      resourcePath: ['rooms', '{proxy+}']
    });
    this.roomsTable.grantReadData(getRoomLambda);

    const cleanRoomsLambda = new EnhancedLambdaFunction(this, 'CleanRooms', {
      initialPolicy: [ivsDeleteResourcesPolicy, ivsGetResourcesPolicy],
      environment: this.commonEnv,
      timeout: Duration.minutes(5),
      entry: getLambdaEntryPath('cleanRooms'),
      functionName: createResourceName(this, 'CleanRooms'),
      description: 'Deletes stale resources (i.e. Stages and Room records)'
    });
    this.roomsTable.grantReadWriteData(cleanRoomsLambda);

    const updatePublishersLambda = new EnhancedLambdaFunction(
      this,
      'UpdatePublishers',
      {
        environment: this.commonEnv,
        timeout: Duration.seconds(30),
        initialPolicy: [ivsGetResourcesPolicy],
        logRetention: logs.RetentionDays.ONE_MONTH,
        entry: getLambdaEntryPath('updatePublishers'),
        functionName: createResourceName(this, 'UpdatePublishers'),
        description: 'Updates Stage publishers via Stage Update events'
      }
    );
    this.roomsTable.grantWriteData(updatePublishersLambda);

    const updateSubscribersLambda = new EnhancedLambdaFunction(
      this,
      'UpdateSubscribers',
      {
        environment: this.commonEnv,
        timeout: Duration.minutes(5),
        initialPolicy: [ivsGetResourcesPolicy],
        logRetention: logs.RetentionDays.ONE_WEEK,
        entry: getLambdaEntryPath('updateSubscribers'),
        functionName: createResourceName(this, 'UpdateSubscribers'),
        description: 'Updates Stage subscribers for active rooms'
      }
    );
    this.roomsTable.grantReadWriteData(updateSubscribersLambda);

    const scheduleSubscriberUpdatesLambda = new EnhancedLambdaFunction(
      this,
      'ScheduleSubscriberUpdates',
      {
        environment: this.commonEnv,
        retryAttempts: 0,
        reservedConcurrentExecutions: 1,
        initialPolicy: [ivsGetResourcesPolicy],
        logRetention: logs.RetentionDays.ONE_WEEK,
        entry: getLambdaEntryPath('scheduleSubscriberUpdates'),
        functionName: createResourceName(this, 'ScheduleSubscriberUpdates'),
        description: 'Schedules updates for active rooms'
      }
    );
    this.roomsTable.grantReadData(scheduleSubscriberUpdatesLambda);

    const activeRoomsQueue = new sqs.Queue(this, 'ActiveRoomsQueue', {
      queueName: `${createResourceName(this, 'ActiveRoomsQueue')}.fifo`,
      contentBasedDeduplication: true,
      receiveMessageWaitTime: Duration.seconds(20),
      visibilityTimeout: calcVisibilityTimeout(updateSubscribersLambda),
      retentionPeriod: Duration.seconds(
        // retentionPeriod = maxReceiveCount * visibilityTimeout
        2 * calcVisibilityTimeout(updateSubscribersLambda).toSeconds()
      )
    });
    activeRoomsQueue.grantSendMessages(scheduleSubscriberUpdatesLambda);
    scheduleSubscriberUpdatesLambda.addEnvironment(
      'ACTIVE_ROOMS_QUEUE_URL',
      activeRoomsQueue.queueUrl
    );

    updateSubscribersLambda.addEventSource(
      new eventSource.SqsEventSource(activeRoomsQueue, {
        batchSize: 10,
        maxConcurrency: 10,
        reportBatchItemFailures: false
      })
    );

    new events.Rule(this, 'StageUpdateRule', {
      ruleName: createResourceName(this, 'StageUpdateRule'),
      targets: [new targets.LambdaFunction(updatePublishersLambda)],
      eventPattern: {
        region: [this.region],
        account: [this.account],
        source: ['aws.ivs'],
        detailType: ['IVS Stage Update']
      }
    });
    new EventScheduleRule(this, 'ScheduleSubscriberUpdatesRule', {
      cronSchedule: { second: '0-59/1', minute: '*' }, // Run every second
      lambdaFunction: scheduleSubscriberUpdatesLambda
    });
    new EventScheduleRule(this, 'CleanRoomsRule', {
      cronSchedule: { minute: '0', hour: this.isDev ? '0-23/6' : '0-23/1' }, // Run every 6 hours in Dev, and every hour otherwise
      lambdaFunction: cleanRoomsLambda
    });

    /**
     * Stack Outputs
     */
    new CfnOutput(this, 'rotateKeyPairFunctionName', {
      value: rotateKeyPairLambda.functionName,
      exportName: createExportName(this, 'rotateKeyPairFunctionName')
    });
  }

  private get isDev() {
    return this.appEnv === AppEnv.DEV;
  }

  private get commonEnv() {
    return {
      ACTIVE_ROOMS_INDEX_NAME: this.activeRoomIndexName,
      ROOMS_TABLE_NAME: this.roomsTable.tableName
    };
  }

  private addRoomAPILambdaProxy(
    lambdaFunction: lambda.Function | lambda.Alias,
    options: { resourcePath?: string[]; httpMethod?: string }
  ) {
    const { resourcePath = [], httpMethod = 'GET' } = options ?? {};
    const resource = resourcePath.reduce<apigw.IResource>(
      (res, pathPart) => res.addResource(pathPart),
      this.roomsApi.root
    );
    const lambdaIntegration = new apigw.LambdaIntegration(lambdaFunction, {
      proxy: true,
      allowTestInvoke: false
    });

    return resource.addMethod(httpMethod, lambdaIntegration);
  }
}

export default BackendStack;
