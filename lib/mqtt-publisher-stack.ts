import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import path = require("path");
import 'dotenv/config'
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as iot from 'aws-cdk-lib/aws-iot';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as AWS from 'aws-sdk';


AWS.config.region = 'us-east-1';

export class MqttPublisherStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // BUCKETS
        const mqqtPublisherS3 = new s3.Bucket(this, process.env.BUCKET!);

        // LAMBDAS
        const deviceRecordsMqttPublisher = new NodejsFunction(this, "MqttPublisher", {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: path.join(__dirname, '/../resources/handlers/deviceRecordsMqttPublisher.mjs'),
            handler: "deviceRecordsMqttPublisher",
            environment: {
                BUCKET: mqqtPublisherS3.bucketName
            },
            bundling: {
                externalModules: [
                    '@aws-sdk/*',
                    'devicerecordssdk@1.0.5',
                ],
            },
        });
        const deviceRecordsMqttHandler: NodejsFunction = new NodejsFunction(this, "MqttHandler", {
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: path.join(__dirname, '/../resources/handlers/deviceRecordsMqttHandler.mjs'),
            handler: "deviceRecordsMqttHandler",
            environment: {
                BUCKET: mqqtPublisherS3.bucketName
            },
            bundling: {
                externalModules: [
                    '@aws-sdk/*',
                    'devicerecordssdk@1.0.5',
                ],
            },
            logGroup: new logs.LogGroup(this, 'DeviceRecordsMqttHandlerLogGroup', {
                retention: logs.RetentionDays.ONE_WEEK, // adjust as needed
            }),
            logFormat: lambda.LogFormat.JSON,
        });

        // HTTP API
        const deviceRecordsIntegration = new HttpLambdaIntegration('deviceRecordsIntegration', deviceRecordsMqttPublisher);
        const api = new HttpApi(this, "messagePublisher-api", {
            apiName: "messagePublisher-api",
            description: "This server publishes messages to a Mqtt broker."
        });
        api.addRoutes({
            path: '/deviceRecords',
            methods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PATCH, HttpMethod.DELETE],
            integration: deviceRecordsIntegration,
        });
        new cdk.CfnOutput(this, 'APIGatewayEndpoint', {
            exportName: 'APIGatewayEndpoint',
            value: api.apiEndpoint,
            description: 'The endpoint url of the API Gateway'
        });

        // IOT
        const deviceRecordsRule = new iot.CfnTopicRule(this, 'deviceRecordsMqttHandlerTopicRule', {
            topicRulePayload: {
                sql: 'SELECT * FROM "/post"',
                actions: [
                    {
                        lambda: {
                            functionArn: deviceRecordsMqttHandler.functionArn,
                        },
                    },
                ],
                ruleDisabled: false,
            },
        });
        new iot.CfnThing(this, 'deviceThing', {})

        // PERMISSIONS
        mqqtPublisherS3.grantReadWrite(deviceRecordsMqttPublisher)
        mqqtPublisherS3.grantReadWrite(deviceRecordsMqttHandler)
        deviceRecordsMqttHandler.addPermission('AllowIot', {
            action: 'lambda:InvokeFunction',
            principal: new iam.ServicePrincipal('iot.amazonaws.com'),
            sourceArn: deviceRecordsRule.attrArn,
        });
        deviceRecordsMqttPublisher.addToRolePolicy(new iam.PolicyStatement({
            actions: ['iot:Publish'],
            resources: [`arn:aws:iot:${AWS.config.region}:${AWS.config.account}${process.env.DEVICE_SHADOW_NAME!}`],
        }));
    }
}