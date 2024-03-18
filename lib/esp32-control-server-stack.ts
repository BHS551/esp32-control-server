import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MqttPublisherStack } from './mqtt-publisher-stack';
import { initializeEnvVars } from '../config/envConfig';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Esp32ControlServerStack extends cdk.Stack {
  private mqqtPublisherStack
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    initializeEnvVars()
    this.mqqtPublisherStack = new MqttPublisherStack(scope, "mqttPublisherStack", props);
  }
}
