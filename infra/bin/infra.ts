#!/usr/bin/env node
import 'source-map-support/register';

import { BackendStack } from '@Lib/stacks';
import {
  BACKEND_STACK_PREFIX,
  WEBSITE_STACK_PREFIX
} from '@Shared/config.json';
import { AppEnv, StackType } from '@Shared/types';
import * as cdk from 'aws-cdk-lib';
import { Environment } from 'aws-cdk-lib';
import WebsiteStack from 'lib/stacks/WebsiteStack';

const app = new cdk.App();
const appEnv = (process.env.APP_ENV || AppEnv.DEV) as AppEnv;
const isBootstrap = JSON.parse(process.env.BOOTSTRAP || 'false');

// Environment
const account = process.env.AWS_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION;
const env: Environment = { account, region };

// Runtime context values
const stackType: StackType = app.node.tryGetContext('stackType');

if (stackType === StackType.BACKEND || isBootstrap) {
  const stackName = `${BACKEND_STACK_PREFIX}-${appEnv}`;
  new BackendStack(app, stackName, { env, appEnv });
}

if (stackType === StackType.WEBSITE || isBootstrap) {
  const stackName = `${WEBSITE_STACK_PREFIX}-${appEnv}`;
  const siteStack = new WebsiteStack(app, stackName, { env, appEnv });

  siteStack.deploy();
}
