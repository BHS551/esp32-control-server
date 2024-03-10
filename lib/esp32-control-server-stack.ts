import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MqttPublisherStack } from './mqtt-publisher-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Esp32ControlServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}
