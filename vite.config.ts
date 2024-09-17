import {
  CloudFormationClient,
  DescribeStacksCommand
} from '@aws-sdk/client-cloudformation';
import reactSWC from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import environment from 'vite-plugin-environment';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

import config from './shared/config.json';

interface StackExports {
  readonly apiUrl?: string;
}

const port = Number(process.env.PORT) || 3000;
/**
 * All SDKs have a series of places (or sources) that they check in order to find valid credentials to use to make a request to an AWS service.
 *
 * Read more about AWS SDK Credential provider chain: https://docs.aws.amazon.com/sdkref/latest/guide/standardized-credentials.html#credentialProviderChain
 */
const cloudFormation = new CloudFormationClient();

const viteConfig = defineConfig(async ({ mode, command }) => {
  const stackExports = await getStackExports(mode);

  return {
    build: {
      emptyOutDir: true,
      outDir: path.resolve(process.cwd(), 'build'),
      rollupOptions: { output: { manualChunks } }
    },
    server: { port, strictPort: true, open: '/' },
    plugins: [
      reactSWC(),
      tsconfigPaths(),
      environment({
        APP_ENV: mode,
        API_URL: stackExports.apiUrl
      }),
      eslint({ emitError: command === 'build' }),
      checker({
        typescript: true,
        overlay: { initialIsOpen: false },
        eslint: {
          lintCommand: 'eslint "src/**/*.{js,jsx,ts,tsx,json}"',
          dev: {
            overrideConfig: {
              overrideConfig: {
                rules: {
                  'no-console': 'off',
                  '@typescript-eslint/no-unused-vars': 'off'
                }
              }
            }
          }
        }
      })
    ]
  };
});

function manualChunks(moduleId: string) {
  const vendor = moduleId.split('/node_modules/')[1]?.split('/')[0];
  const vendorChunks = [
    'amazon-ivs-web-broadcast',
    'framer-motion',
    'tailwindcss'
  ];

  if (vendor) {
    const vendorChunk = vendorChunks.find((vc) => vendor.includes(vc));

    return vendorChunk ? `vendor_${vendorChunk}` : 'vendor';
  }
}

async function getStackExports(mode: string): Promise<StackExports> {
  const stackName = `${config.BACKEND_STACK_PREFIX}-${mode}`;
  const dsCommand = new DescribeStacksCommand({ StackName: stackName });
  const dsResponse = await cloudFormation.send(dsCommand);
  const stackOutputs = dsResponse.Stacks?.[0]?.Outputs ?? [];
  const stackExports = stackOutputs.reduce((exps, output) => {
    const [exportKey] = output.ExportName!.split('::').slice(-1);

    return { ...exps, [exportKey]: output.OutputValue };
  }, {}) as StackExports;

  return {
    apiUrl: stackExports.apiUrl
  };
}

export default viteConfig;
