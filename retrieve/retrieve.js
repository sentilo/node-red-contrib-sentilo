var restClient = require('../libs/sentiloRestClient');

module.exports = function(RED) {
    
    function resetStatus(node, delay) {
        setTimeout(() => {
            node.status({ fill: 'blue', shape: 'dot', text: 'Waiting for data' });
        }, delay);
    }

    function Retrieve(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);

        node.on('input', (msg, nodeSend, nodeDone) => {


            node.providerId = config.providerId || msg.providerId;
            node.dataType = config.dataType || msg.dataType ;
            node.identifier = config.identifier || msg.identifier;
            node.limit = config.limit || msg.limit ;
            node.from = config.from || msg.from ;
            node.to = config.to || msg.to ;
            node.trigger = config.trigger || msg.trigger ;
            node.alertType = config.alertType || msg.alertType ;
            node.componentId = config.componentId || msg.componentId ;
            node.componentType = config.componentType || msg.componentType ;
            node.sensorType = config.sensorType || msg.sensorType ;
            node.subscriptionType = config.subscriptionType || msg.subscriptionType ;

            node.path = getPath(node);


            if (retrieveValidateRequiredFields(node, msg)) {
                
                node.status({ fill: 'green', shape: 'ring', text: 'Processing...' });

                restClient.request(
                    'GET',
                    node.server.host,
                    node.path,
                    node.server.acceptUntrusted,
                    node.server.credentials.apiKey,
                    null, // In GET methods there aren't input data
                    (responseObject) => {
                        node.status({ fill: 'green', shape: 'dot', text: 'Success' });
                        resetStatus(node, 5000);

                        msg.payload = responseObject.message;
                        var msg2 = { payload: responseObject.code }
                        nodeSend([ msg, msg2 ]);
                        if(nodeDone) nodeDone();
                    },
                    (errorMessage) => {
                        node.status({ fill: 'red', shape: 'dot', text: 'ERROR!' });
                        resetStatus(node, 5000);
                        node.error({'payload': {}, 'response': errorMessage, 'path': node.path}, msg);

                        msg.payload = errorMessage.message;
                        var msg2 = { payload: errorMessage.code}
                        nodeSend([ msg, msg2 ]);
                        if(nodeDone) nodeDone();
                    }
                );
            
            }
            
        });


    }

    function retrieveValidateRequiredFields(node, msg) {

        let valid = true;

        if(!node.dataType) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            reportError(node, msg, 'Data Type is not defined. Please fill the setting dialog or use msg.dataType');
            valid = false;

        } else if (['alarm', 'alert', 'catalog', 'data', 'order', 'subscribe'].indexOf(node.dataType.toLowerCase()) < 0) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            reportError(node, msg, "Data Type is not one of 'alarm', 'alert', 'catalog', 'data', 'order' or 'subscribe'.");
            valid = false;
        }
            
        if(!node.server) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            reportError(node, msg, 'Host field content is blank in server connection with no alias');
            valid = false;

        } else {
            if(!node.server.host) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                reportError(node, msg, 'Host field content is blank in server connection with alias \'' + alias + '\'');
                valid = false;
            }
        
            if(!node.server.credentials.apiKey) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                reportError(node, msg, 'API key field content is blank in server connection with alias \'' + alias + '\'');
                valid = false;
            }
        }
    
        switch(node.dataType.toLowerCase()) {
    
            case 'alert': 
                // Required providerId ; Optionals: alertType, trigger
                if(!node.providerId) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    reportError(node, msg, 'Field providerId is mandatory');
                    valid = false;
                }
                break;
    
            case 'catalog': 
                // Optionals: sensorType, componentId, componentType
                break;
    
            case 'alarm': 
                // Required: alarmId(identifier) ; Optionals: limit, from, to
                if(!node.identifier) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    reportError(node, msg, 'Field alarmId (the id field) is mandatory');
                    valid = false;
                }
                break;
            case 'data': 
            case 'order': 
                // Required either sensorId (identifier)  providerId ; Optionals: from, to, limit
                if ( !node.providerId ) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    reportError(node, msg, 'The field providerId is mandatory');
                    valid = false;
                }
                break;
    
            case 'subscription': 
                // Related to our token ; Optionals: subscriptionType
                if (node.subscriptionType && ['alarm', 'data', 'order'].indexOf(node.subscriptionType.toLowerCase()) < 0) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    reportError(node, msg, "Subscription Type is not one of 'alarm', 'data', 'order'.");
                    valid = false;
                }
                break;
    
        }
    
        return valid;
    }

    function getPath(node) {
        let basePath = retrieveGetSentiloRequestPath(node);

        return retrieveQueryString(node, basePath);
    }

    function retrieveGetSentiloRequestPath(node) {
        switch(node.dataType) {
            case 'alarm':       return '/alarm';
            case 'alert':       return '/catalog/alert';
            case 'catalog':     return '/catalog';
            case 'data':        return '/data';
            case 'order':       return '/order';
            case 'subscribe':   return '/subscribe';
            default:            return '';
        }
    }

    function reportError(node, msg, errString) {
        if (msg) {
            node.error(errString, msg);
        } else {
            node.error(errString);
        }
    }

    function retrieveQueryString(node, baseBath) {

        var queryString = '';

        switch(node.dataType) {

            case 'alert':
                // Required providerId ; Optionals: alertType, trigger
                requestPath = retrieveAddPathToRequestPath(baseBath, node.providerId);
                queryString = retrieveAddParamToQueryString(queryString, 'type', node.alertType);
                queryString = retrieveAddParamToQueryString(queryString, 'trigger', node.trigger);
                break;

            case 'catalog':
                // Optionals: providerId, sensorType, componentId, componentType
                requestPath = retrieveAddPathToRequestPath(baseBath, node.providerId);
                queryString = retrieveAddParamToQueryString(queryString, 'type', node.sensorType);
                queryString = retrieveAddParamToQueryString(queryString, 'component', node.componentId);
                queryString = retrieveAddParamToQueryString(queryString, 'componentType', node.componentType);
                break;

            case 'alarm':
                // Required: alarmId(identifier) ; Optionals: limit, from, to
                requestPath = retrieveAddPathToRequestPath(baseBath, node.identifier);
                // Optionals: from, to, limit
                queryString = retrieveAddParamToQueryString(queryString, 'limit', node.limit);
                queryString = retrieveAddParamToQueryString(queryString, 'from', node.from);
                queryString = retrieveAddParamToQueryString(queryString, 'to', node.to);
                break;
            case 'data':
                // Required either sensorId (identifier) or providerId ; Optionals: from, to, limit
            case 'order':
                // Required either sensorId (identifier) or providerId
                requestPath = retrieveAddPathToRequestPath(baseBath, node.providerId);
                requestPath = retrieveAddPathToRequestPath(requestPath, node.identifier);

                // Optionals: from, to, limit
                queryString = retrieveAddParamToQueryString(queryString, 'limit', node.limit);
                queryString = retrieveAddParamToQueryString(queryString, 'from', node.from);
                queryString = retrieveAddParamToQueryString(queryString, 'to', node.to);
                break;

            case 'subscribe':
                // Related to our token ; Required as request path: subscriptionType
                requestPath = retrieveAddPathToRequestPath(baseBath, node.subscriptionType);
                break;
        }

        return requestPath+queryString;

    }

    function retrieveAddParamToQueryString(queryString, paramName, paramValue) {
        if (!queryString) {
            if (paramValue) {
                queryString = '?' + paramName + '=' + paramValue;
            }
        } else {
            if (paramValue) {
                queryString += '&' + paramName + '=' + paramValue;
            }
        }
        return queryString;
    }

    function retrieveAddPathToRequestPath(requestPath, path) {
        if (path) {
            return requestPath + '/' + path;
        }
        return requestPath;
    }

    RED.nodes.registerType('retrieve', Retrieve);
}

