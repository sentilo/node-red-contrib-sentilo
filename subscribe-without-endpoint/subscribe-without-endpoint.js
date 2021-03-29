var restClient = require('../libs/sentiloRestClient');

module.exports = function(RED) {
    function resetStatus(node, delay) {
        setTimeout(() => {
            node.status({ fill: 'blue', shape: 'dot', text: 'Waiting for data' });
        }, delay);
    }

    function SubscribeWithoutEndpoint(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);
        node.providerIdField = config.providerId;
        node.identifierField = config.identifier;
        node.subscriptionTypeField = config.subscriptionType;
        node.callbackUrlField = config.callbackUrl;
        node.method = 'PUT';


        node.on('input', (msg, nodeSend, nodeDone) => {
            if (node.validateRequiredFields(node, msg)) {

                node.status({ fill: 'green', shape: 'ring', text: 'Processing...' });

                node.path = node.createPath(node, msg);

                // method, host, path, apiKey, payload, callback, errorCallback
                restClient.request(
                    node.method,
                    node.server.host,
                    node.path,
                    node.server.acceptUntrusted,
                    node.server.apiKey,
                    { "endpoint": node.callbackUrl },
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
                        node.error(JSON.stringify({'payload': msg.payload, 'response': errorMessage}), msg);

                        msg.payload = errorMessage.message;
                        var msg2 = { payload: errorMessage.code}
                        nodeSend([ msg, msg2 ]);
                        if(nodeDone) nodeDone();
                    }
                );
            }

        });

    }


    SubscribeWithoutEndpoint.prototype.createPath = function (node, msg) {
        var url = '';
        if (node.subscriptionType == 'alarm') {
            url = '/subscribe/'+ node.subscriptionType +'/'+ node.identifier;
        } else{
            if (node.identifier) {
                url = '/subscribe/'+ node.subscriptionType +'/'+ node.providerId +'/'+ node.identifier +'/';
            } else {
                url = '/subscribe/'+ node.subscriptionType +'/' + node.providerId + '/';
            }
        }
        return url;
    }


    SubscribeWithoutEndpoint.prototype.validateRequiredFields = function (node, msg) {

        var valid = true;

        if(!node.server) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Host field content is blank in server connection with no alias');
            valid = false;
        } else {
            if(!node.server.host) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('Host field content is blank in server connection with alias \'' + alias + '\'');
                valid = false;
            }
        
            if(!node.server.apiKey) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('API key field content is blank in server connection with alias \'' + alias + '\'');
                valid = false;
            }
        }

        // providerId
        if(node.providerIdField) {
            var providerIdValue = false;
            try {
                providerIdValue = msg[node.providerIdField];
                node.providerId = providerIdValue;
            }catch (e) {}
            if (!providerIdValue) {
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('Field '+ node.providerIdField +' not found in msg object');
                valid = false;
            }
        }

        // callbackUrl
        if(!node.callbackUrlField) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Field name that contains callback URL is mandatory');
            valid = false;
        }
        var callbackUrlValue = false;
        try {
            callbackUrlValue = msg[node.callbackUrlField];
            node.callbackUrl = callbackUrlValue;
        }catch (e) {}
        if (!callbackUrlValue) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Field '+ node.callbackUrlField +' not found in msg object');
            valid = false;
        }


        // identifier NOT always mandatory (see subscriptionType validation that follows)
        if(node.identifierField) {
            var identifierValue = false;
            try {
                // node.error("MSG: "+JSON.stringify(msg));
                // node.error("IDENTIFIERFIELD: "+node.identifierField);
                identifierValue = msg[node.identifierField];
                node.identifier = identifierValue;
            }catch (e) {
                // node.error("EEE: "+e);
            }
            if (!identifierValue) {
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('Field '+ node.identifierField +' not found in msg object');
                valid = false;
            }
        }


        // subscriptionType
        if(!node.subscriptionTypeField) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Field name that contains subscription type is mandatory');
            valid = false;
        }
        var subscriptionTypeValue = false;
        try {
            subscriptionTypeValue = msg[node.subscriptionTypeField];
            node.subscriptionType = subscriptionTypeValue.toLowerCase();
        }catch (e) {}
        if (!subscriptionTypeValue) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Field '+ node.subscriptionTypeField +' not found in msg object');
            valid = false;
        }

        switch(node.subscriptionType.toLowerCase()) {
            case 'alarm':
                // Required alertId
                if(!node.identifier) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field indicating Alert Id is mandatory. Please set the property name for the msg object in the "Identifier" field.');
                    valid = false;
                }
                break;

            case 'data':
            case 'order':
                // Required alertId
                if(!node.providerId) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field indicating Order Id is mandatory. Please set the property name for the msg object in the "Identifier" field.');
                    valid = false;
                }
                break;
            default:
                node.error('Invalid value for subscription type:'+ node.subscriptionType );
                valid = false;

        }
    
        return valid;
    }


    RED.nodes.registerType('subscribe-without-endpoint', SubscribeWithoutEndpoint);
}

