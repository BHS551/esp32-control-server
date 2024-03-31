import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MqttPublisherStack } from './mqtt-publisher-stack';

export class Esp32ControlServerStack extends cdk.Stack {
  private mqqtPublisherStack
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.mqqtPublisherStack = new MqttPublisherStack(scope, "mqttPublisherStack", props);
  }
}
