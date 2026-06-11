#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { IdenteraStack } from "../lib/identera-stack";

const app = new cdk.App();

new IdenteraStack(app, "IdenteraStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
  },
  description: "Identera — Lambda + API Gateway + DynamoDB",
});
