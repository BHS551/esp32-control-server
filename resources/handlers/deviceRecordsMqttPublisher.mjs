import deviceRecordsSdk from "devicerecordssdk/data/records";
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";

const requestMethodToDeviceOperation = {
    [HttpMethod.GET]: async (...args) => {
        return await listDeviceRecords(...args)
    },
    [HttpMethod.POST]: async (...args) => {
        return await postDeviceMqtt(...args)
    },
}

const operationResolver = async (payload) => {
    console.log("[index.operationResolver] lambda event data: ", payload)
    const operationFunction = requestMethodToDeviceOperation[payload.method]
    const response = await operationFunction(payload.body)
    return response
};

const listDeviceRecords = async () => {
    console.log("[index.listDeviceRecords] listing device records")
    const objects = await deviceRecordsSdk.listDeviceRecords(process.env.BUCKET);
    console.log("[index.listDeviceRecords] device records listed: ", objects)
    return buildResponseBody(200, objects);
};

const postDeviceMqtt = async (postDeviceMqttPayload) => {
    console.log("[index.postDeviceMqtt] posting device mqtt: ", postDeviceMqttPayload)
    await deviceRecordsSdk.postDeviceMqtt({ ...postDeviceMqttPayload });
    console.log("[index.postDeviceMqtt] device mqtt posted")
    return buildResponseBody(200, {
        result: "device mqtt posted"
    });
};

const deviceRecordsHandler = async (event) => {
    console.log("[index.handler] input event: ", { event })
    const { requestContext, body } = event
    const { http } = requestContext
    try {
        // body property is optional since it depends of the request method
        const operationResolverPayload = {
            method: http.method,
            body: body ? JSON.parse(body) : undefined,
        }
        const response = await operationResolver(operationResolverPayload);
        console.log(response)
        return response
    } catch (err) {
        console.error(err);
        return buildResponseBody(500, err.message || "Unknown server error");
    }
};

const buildResponseBody = (status, body, headers = {}) => {
    return {
        statusCode: status,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    };
};

export { deviceRecordsHandler }