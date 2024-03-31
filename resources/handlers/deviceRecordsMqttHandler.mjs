import deviceRecordsSdk from "devicerecordssdk/data/records";

const requestMethodToDeviceOperation = {
    insert: async (...args) => await insertDeviceRecord(...args),
    get: async (...args) => await listDeviceRecords(...args)
}

const listDeviceRecords = async () => {
    console.log("[deviceRecordsMqttHandler.listDeviceRecords] listing device records")
    const objects = await deviceRecordsSdk.listDeviceRecords(process.env.BUCKET);
    console.log("[deviceRecordsMqttHandler.listDeviceRecords] device records listed: ", objects)
    return buildResponseBody(200, objects);
};

const insertDeviceRecord = async (insertDeviceRecordPayload) => {
    console.log("[deviceRecordsMqttHandler.insertDeviceRecord] inserting device record: ", insertDeviceRecordPayload)
    await deviceRecordsSdk.insertDeviceRecord({ ...insertDeviceRecordPayload }, process.env.BUCKET);
    console.log("[deviceRecordsMqttHandler.insertDeviceRecord] device record inserted")
    return buildResponseBody(200, {
        result: "record inserted"
    });
};

const operationResolver = async (event) => {
    console.log("[deviceRecordsMqttHandler.operationResolver] lambda event data: ", event)
    const operationFunction = requestMethodToDeviceOperation[event.operation]
    const response = await operationFunction(event.payload)
    return response
};

const deviceRecordsMqttHandler = async (event) => {
    console.log("[deviceRecordsMqttHandler.handler] input event: ", { event })
    try {
        const response = await operationResolver(event);
        return response
    } catch (err) {
        throw new Error(err)
    }
};


export { deviceRecordsMqttHandler }