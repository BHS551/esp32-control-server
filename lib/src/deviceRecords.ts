import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

/**
 * @param {string} bucketName
 */
const listObjectNames = async (bucketName) => {
    console.log("[index.listObjectNames] sending command to s3")
    let response = []
    try {
        const command = new ListObjectsCommand({ Bucket: bucketName });
        const { Contents = [] } = await s3Client.send(command);
        if (!Contents.length) {
            const err = new Error(`No objects found in ${bucketName}`);
            err.name = "EmptyBucketError";
            throw err;
        }
        response = Contents.map(({ Key }) => Key).filter((k) => !!k);
    } catch (err) {
        console.log("[index.listObjectNames] error sending command to s3: ", err)
        throw new Error(err)
    }
    console.log("[index.listObjectNames] command to s3 sent")

    // Map the response to a list of strings representing the keys of the Amazon Simple Storage Service (Amazon S3) objects.
    // Filter out any objects that don't have keys.
    return response
};

export { listObjectNames }