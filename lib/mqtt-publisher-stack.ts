import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import path = require("path");
import 'dotenv/config'
import envVars from "../config/envConfig";
import * as iam from 'aws-cdk-lib/aws-iam';

export class MqttPublisherStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const mqqtPublisherS3 = new s3.Bucket(this, envVars.Bucket);

        const handler = new lambda.Function(this, "MqttPublisher", {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, '/../resources/actionsHandler')),
            handler: "index.handler",
            environment: {
                BUCKET: mqqtPublisherS3.bucketName
            }
        });

        // const authFunc = new lambda.Function(this, 'AuthorizationFunction', {
        //     runtime: lambda.Runtime.NODEJS_18_X,
        //     code: lambda.Code.fromAsset(path.join(__dirname, '/../resources/auth')),
        //     handler: "index.handler",
        // })

        // const auth = new apigateway.TokenAuthorizer(this, 'NewRequestAuthorizer', {
        //     handler: authFunc,
        //     identitySource: 'method.request.header.AuthorizeToken'

        // })
        // Define your specific IP address
        // const specificIpAddress = 'YOUR_SPECIFIC_IP_ADDRESS';

        // Create the custom IAM policy

        const api = new apigateway.RestApi(this, "mqttPublisher-api", {
            restApiName: "Mqtt publisher",
            description: "This server publishes messages to a Mqtt broker."
        });

        // Define an IAM policy to allow access to the S3 bucket
        // const s3PolicyStatement = new iam.PolicyStatement({
        //     effect: iam.Effect.ALLOW,
        //     actions: ['s3:GetObject', 's3:PutObject', "s3:ListBucket"], // Adjust actions as needed
        //     resources: [mqqtPublisherS3.bucketArn + '/*'], // Adjust resource ARN as needed
        // });

        // handler.role?.addToPrincipalPolicy(s3PolicyStatement)

        mqqtPublisherS3.grantReadWrite(handler)

        const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        api.root.addMethod("GET", getWidgetsIntegration, {}); // GET /
    }
}