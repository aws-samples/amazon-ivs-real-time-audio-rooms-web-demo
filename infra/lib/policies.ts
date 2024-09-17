import { aws_iam as iam } from 'aws-cdk-lib';

const ivsGetResourcesPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ivs:GetParticipant', 'ivs:ListParticipants', 'ivs:ListStages'],
  resources: ['*']
});

const ivsCreateResourcesPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ivs:CreateStage'],
  resources: ['*']
});

const ivsDeleteResourcesPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ivs:DeleteStage'],
  resources: ['*']
});

const ivsPublicKeyPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ivs:ImportPublicKey', 'ivs:GetPublicKey', 'ivs:DeletePublicKey'],
  resources: ['*']
});

const ivsTagResourcesPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['ivs:TagResource'],
  resources: ['*']
});

const kmsGenerateDataKeyPairPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ['kms:GenerateDataKeyPair'],
  resources: ['*']
});

export {
  ivsCreateResourcesPolicy,
  ivsDeleteResourcesPolicy,
  ivsGetResourcesPolicy,
  ivsPublicKeyPolicy,
  ivsTagResourcesPolicy,
  kmsGenerateDataKeyPairPolicy
};
