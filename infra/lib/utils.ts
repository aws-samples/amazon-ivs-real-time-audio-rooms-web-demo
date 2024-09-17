import { Stack } from 'aws-cdk-lib';
import path from 'path';

function createExportName(stack: Stack, id: string) {
  return `${stack.stackName}::${id}`;
}

function createResourceName(stack: Stack, id: string) {
  return `${stack.stackName}-${id}`;
}

function getLambdaEntryPath(functionName: string) {
  return path.format({
    dir: path.resolve(import.meta.dirname, '../lambdas/handlers'),
    name: functionName,
    ext: '.ts'
  });
}

export { createExportName, createResourceName, getLambdaEntryPath };
