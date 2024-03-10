import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

export class MqttPublisherStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mqqtPublisherS3 = new s3.Bucket(this, "MqttPublisherStore");

        const handler = new lambda.Function(this, "MqttPublisher", {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset("resources"),
            handler: "actionsHandler.main",
            environment: {
                BUCKET: mqqtPublisherS3.bucketName
            }
        });

        const api = new apigateway.RestApi(this, "mqttPublisher-api", {
            restApiName: "Mqtt publisher",
            description: "This server publishes messages to a Mqtt broker."
        });

        const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        api.root.addMethod("GET", getWidgetsIntegration); // GET /
    }
}