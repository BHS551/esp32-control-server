export const handler = async function (event) {
    console.log(event)
    let token = event.authorizationToken
    let effect = 'Deny'
    if (token == "abc") {
        effect = 'Allow'
    } else {
        effect = 'Deny'
    }
    const response = generatePolicy("user", effect, event.methodArn)
    console.log(effect)
    console.log(response.policyDocument.Statement[0])
    return response

}


// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
    var authResponse = {
        "policyDocument": {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "principal": '*',
                    "Action": "execute-api:Invoke",
                    "Effect": effect,
                    "Resource": resource
                }
            ]
        }
    }
    return authResponse;
}