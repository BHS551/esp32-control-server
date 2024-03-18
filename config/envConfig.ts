const envVars = {
    Bucket: ""
}

const initializeEnvVars = () => {
    envVars.Bucket = process.env.BUCKET!
}

export { envVars, initializeEnvVars }