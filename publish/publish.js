var restClient = require('../libs/sentiloRestClient');

module.exports = function(RED) {
    function resetStatus(node, delay) {
        setTimeout(() => {
            node.status({ fill: 'blue', shape: 'dot', text: 'Waiting for data' });
        }, delay);
    }

    function Publish(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        node.server = RED.nodes.getNode(config.server);
        node.path = config.urlRaw;
        node.providerId = config.providerId;
        node.identifier = config.identifier;
        node.dataType = config.dataType;
        node.method = (node.dataType === 'catalog') ? 'POST' : 'PUT';

        node.on('input', (msg) => {
            if (publishValidateRequiredFields(node, msg)) {

                node.status({ fill: 'green', shape: 'ring', text: 'Processing...' });

                if (msg.identifier) {
                    node.path += '/' + msg.identifier;
                }

                // method, host, path, apiKey, payload, callback, errorCallback
                restClient.request(
                    node.method,
                    node.server.host,
                    node.path,
                    node.server.credentials.apiKey,
                    msg.payload,
                    (responseObject) => {
                        node.status({ fill: 'green', shape: 'dot', text: 'Success' });
                        resetStatus(node, 5000);
                        msg.payload = responseObject;
                        node.send(msg);
                    },
                    (errorMessage) => {
                        node.status({ fill: 'red', shape: 'dot', text: 'ERROR!' });
                        resetStatus(node, 5000);
                        node.error(JSON.stringify({'payload': msg.payload, 'response': errorMessage}), msg);
                    }
                );
            }

        });

    }

    function publishValidateRequiredFields(node, msg) {

        var valid = true;

        if(!node.server) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Host field content is blank in server connection with no alias');
            if (msg) {
                node.error('Host field content is blank in server connection with no alias', msg);
            }
            valid = false;
        } else {
            if(!node.server.host) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('Host field content is blank in server connection with alias \'' + alias + '\'');
                if (msg) {
                    node.error('Host field content is blank in server connection with alias \'' + alias + '\'', msg);
                }
                valid = false;
            }
        
            if(!node.server.credentials.apiKey) {
                var alias = node.server.alias || '<no alias>';
                node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                node.error('API key field content is blank in server connection with alias \'' + alias + '\'');
                if (msg) {
                    node.error('API key field content is blank in server connection with alias \'' + alias + '\'', msg);
                }
                valid = false;
            }
        }
    
        switch(node.dataType.toLowerCase()) {
            case 'alarm':
                // Required alertId
                if(!node.identifier && !msg.identifier) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field alertId (id) is mandatory');
                    if (msg) {
                        node.error('Field alertId (id) is mandatory', msg);
                    }
                    valid = false;
                }
                break;

            case 'catalog':
                if (!msg.payload) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Message payload is mandatory');
                    if (msg) {
                        node.error('Message payload is mandatory', msg);
                    }
                    valid = false; 
                }
                break;
            
            case 'data':
            case 'order':
                // Required alertId
                if(!node.providerId) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field providerId (id) is mandatory');
                    if (msg) {
                        node.error('Field providerId (id) is mandatory', msg);
                    }                
                    valid = false;
                }
                break;
        }
    
        return valid;
    }

    RED.nodes.registerType('publish', Publish);
}

