import deviceRecords from "../../src/deviceRecords";

/**
 *
 * @param {LambdaEvent} lambdaEvent
 */
const routeRequest = async (lambdaEvent) => {
    console.log("[index.routeRequest] lambda event data: ", lambdaEvent)
    return await handleGetRequest();
};

const handleGetRequest = async () => {
    if (process.env.BUCKET === "undefined") {
        const err = new Error(`No bucket name provided.`);
        err.name = "MissingBucketName";
        throw err;
    }
    console.log(process.env.BUCKET)
    const objects = await deviceRecords.listObjectNames(process.env.BUCKET);
    return buildResponseBody(200, JSON.stringify(objects));
};

/**
 * @typedef {{statusCode: number, body: string, headers: Record<string, string> }} LambdaResponse
 */

/**
 *
 * @param {number} status
 * @param {Record<string, string>} headers
 * @param {Record<string, unknown>} body
 *
 * @returns {LambdaResponse}
 */
const buildResponseBody = (status, body, headers = {}) => {
    return {
        statusCode: status,
        headers,
        body,
    };
};

/**
 *
 * @param {LambdaEvent} event
 */
export const handler = async (event) => {
    console.log("[actionsHandler.index.handler] input event: ", { event })
    try {
        return await routeRequest(event);
    } catch (err) {
        console.error(err);

        if (err.name === "MissingBucketName") {
            return buildResponseBody(400, err.message);
        }

        if (err.name === "EmptyBucketError") {
            return buildResponseBody(204, []);
        }

        if (err.name === "UnimplementedHTTPMethodError") {
            return buildResponseBody(400, err.message);
        }

        return buildResponseBody(500, err.message || "Unknown server error");
    }
};
