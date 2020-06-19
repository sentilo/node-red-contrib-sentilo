
module.exports = {
    
    request: function(method, host, path, acceptUntrusted, apiKey, payload, callback, errorCallback) {

        var dataString = JSON.stringify(payload);
        var requestHostProperties = getRequestHostProperties(host);
        var options = getRequestOptions(method, requestHostProperties, path, apiKey, dataString);

        var protocol = require('http');
        if (requestHostProperties.protocol === 'https') {
            protocol = require('https');

            if(acceptUntrusted == true) {
                options.rejectUnauthorized = false;
            }
        }

        var req = protocol.request(options, (res) => {

            res.setEncoding('UTF-8');

            var responseString = '';

            res.on('data', (data) => {
                responseString += data;
            });

            res.on('end', () => {
                var response = {};

                if(responseString) {
                    try{
                        response.message = JSON.parse(responseString);
                    } catch(error) {
                        console.error("The reponse was not a parseable JSON: "+responseString);
                    }

                }
                response.code = res.statusCode;

                if(response.code == 200) {
                    callback(response);
                } else {
                    errorCallback(response);
                }
            });
        });

        req.on('error', (e) => {
            errorCallback(e);
        });

        if(dataString) {
            req.write(dataString);
        } 
        
        req.end();
        
    }
};

function getHeaders(method, apiKey, dataString) {

    var headers = {};

    if (method === 'GET') {
        headers = {
            'IDENTITY_KEY': apiKey
        };
    } else {
        headers = {
            'IDENTITY_KEY': apiKey,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(dataString, 'UTF-8')
        };
    }

    return headers;
}

function getRequestOptions(method, requestHostProperties, path, apiKey, dataString) {
    
    var headers = getHeaders(method, apiKey, dataString);

    return {
        host: requestHostProperties.host,
        port: requestHostProperties.port,
        path: path,
        method: method,
        headers: headers
    };

}

function getRequestHostProperties(host) {

    var targetHost, port, protocol;

    if (!host.startsWith('http')) host = 'http://' + host;

    var url = new URL(host);

    if(url.protocol == 'http:') protocol = 'http';
    else if(url.protocol == 'https:') protocol = 'https';
    else protocol = 'http';

    if(url.port) port = url.port;
    else if (protocol == 'http') port = 80;
    else if (protocol == 'https') port = 443;
    else port = 80;

    targetHost = url.hostname;

    return {
        'host' : targetHost,
        'port' : port,
        'protocol' : protocol
    };

}
