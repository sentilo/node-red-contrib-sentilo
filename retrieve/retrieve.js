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
        node.path = config.urlRaw
        node.providerId = config.providerId;
        node.identifier = config.identifier;
        node.dataType = config.dataType;

        node.on('input', (msg) => {

            if (retrieveValidateRequiredFields(node, msg)) {
                
                node.status({ fill: 'green', shape: 'ring', text: 'Processing...' });

                restClient.request(
                    'GET',
                    node.server.host,
                    node.path,
                    node.server.credentials.apiKey,
                    null, // In GET methods there aren't input data
                    (responseObject) => {
                        node.status({ fill: 'green', shape: 'dot', text: 'Success' });
                        resetStatus(node, 5000);
                        msg.payload = responseObject;
                        node.send(msg);
                    },
                    (errorMessage) => {
                        node.status({ fill: 'red', shape: 'dot', text: 'ERROR!' });
                        resetStatus(node, 5000);
                        node.error(errorMessage, msg);
                    }
                );
            
            }
            
        });

        retrieveValidateRequiredFields(node, null);
    }

    function retrieveValidateRequiredFields(node, msg) {

        var valid = true;
            
        if(!node.server || !node.server.host) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('Host field content is blanck in server connection with alias \'' + node.server.alias + '\'');
            if (msg) {
                node.error('Host field content is blanck in server connection with alias \'' + node.server.alias + '\'', msg);
            }
            valid = false;
        }
    
        if(!node.server || !node.server.credentials.apiKey) {
            node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
            node.error('API key field content is blank in server connection with alias \'' + node.server.alias + '\'');
            if (msg) {
                node.error('API key field content is blank in server connection with alias \'' + node.server.alias + '\'', msg);
            }
            valid = false;
        }
    
        switch(node.dataType.toLowerCase()) {
    
            case 'alert': 
                // Required providerId ; Optionals: alertType, trigger
                if(!node.providerId) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field providerId is mandatory');
                    if (msg) {
                        node.error('Field providerId is mandatory', msg);
                    }
                    valid = false;
                }
                break;
    
            case 'catalog': 
                // Optionals: sensorType, component, componentType
                break;
    
            case 'alarm': 
                // Required: alarmId(identifier) ; Optionals: limit, from, to
                if(!node.identifier) {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Field alarmId (the id field) is mandatory');
                    if (msg) {
                        node.error('Field alarmId (the id field) is mandatory', msg);
                    }
                    valid = false;
                }
                break;
            case 'data': 
            case 'order': 
                // Required either sensorId (identifier)  providerId ; Optionals: from, to, limit
                if ( node.providerId === '' && node.identifier === '' || node.providerId === '' && node.identifier !== '') {
                    node.status({ fill: 'red', shape: 'dot', text: 'SETTINGS ERROR!' });
                    node.error('Either fields providerId or providerId & sensorId (the id field) are mandatory');
                    if (msg) {
                        node.error('Either fields providerId or providerId & sensorId (the id field) are mandatory', msg);
                    }
                    valid = false;
                }
                break;
    
            case 'subscription': 
                // Related to our token ; Optionals: subscriptionType
                break;
    
        }
    
        return valid;
    }

    RED.nodes.registerType('retrieve', Retrieve);
}

