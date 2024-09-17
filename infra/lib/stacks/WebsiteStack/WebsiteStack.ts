import { EnhancedS3Bucket } from '@Lib/constructs';
import { createResourceName } from '@Lib/utils';
import { AppEnv } from '@Shared/types';
import {
  aws_cloudfront as cf,
  aws_cloudfront_origins as origins,
  aws_s3_deployment as s3d,
  CfnOutput,
  Stack,
  StackProps
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import fs from 'fs';
import path from 'path';

import { createErrorResponse } from './utils';

interface WebsiteStackProps extends StackProps {
  readonly appEnv: AppEnv;
}

const BUILD_PATH = path.resolve(import.meta.dirname, '../../../../build');

class WebsiteStack extends Stack {
  readonly appEnv: AppEnv;

  readonly originPath: string;

  constructor(scope: Construct, id: string, props: WebsiteStackProps) {
    super(scope, id, props);
    this.appEnv = props.appEnv;

    this.originPath = Date.now().toString();
  }

  deploy() {
    const websiteBucket = new EnhancedS3Bucket(this, 'WebsiteBucket', {
      bucketName: `${this.stackName}-website`
    });

    const oai = new cf.OriginAccessIdentity(this, 'OAI');
    websiteBucket.grantRead(oai);

    const s3Origin = new origins.S3Origin(websiteBucket, {
      originPath: `/${this.originPath}`,
      originAccessIdentity: oai
    });

    const cacheControlResponseHeadersPolicy = new cf.ResponseHeadersPolicy(
      this,
      'CacheControlHeaders',
      {
        responseHeadersPolicyName: createResourceName(
          this,
          `CacheControlHeaders-${this.stackName.replaceAll('.', '_')}`
        ),
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
              override: true
            },
            { header: 'Pragma', value: 'no-cache', override: true },
            { header: 'Expires', value: '-1', override: true }
          ]
        }
      }
    );

    const distribution = new cf.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: s3Origin,
        allowedMethods: cf.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cf.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cf.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cf.OriginRequestPolicy.CORS_S3_ORIGIN,
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: cacheControlResponseHeadersPolicy
      },
      enableIpv6: true,
      defaultRootObject: 'index.html',
      httpVersion: cf.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cf.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [createErrorResponse(403), createErrorResponse(404)]
    });

    new s3d.BucketDeployment(this, 'BucketDeployment', {
      distribution,
      distributionPaths: ['/*'],
      destinationBucket: websiteBucket,
      destinationKeyPrefix: this.originPath,
      sources: fs.existsSync(BUILD_PATH) ? [s3d.Source.asset(BUILD_PATH)] : []
    });

    new CfnOutput(this, 'distributionDomainName', {
      value: distribution.distributionDomainName
    });
  }
}

export default WebsiteStack;
