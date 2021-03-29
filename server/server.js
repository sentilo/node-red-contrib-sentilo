module.exports = function(RED) {
    function SentiloServerNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        validate(config);

        node.alias = config.alias;
        node.host = config.host;
        node.acceptUntrusted = config.acceptUntrusted;
        node.apiKey = config.apiKey;
    }


    function validate(config) {
        if (!config.alias) {
            node.error('Alias is empty or not valid');
        }
        if (!config.host) {
            node.error('Host is empty or not valid');
        }
        if (config.acceptUntrusted === undefined || config.acceptUntrusted === null) {
            node.error('AcceptUntrusted is empty or not valid');
        }
        if (!config.apiKey) {
            node.error('Api key (token) is empty.');
        }
    }


    RED.nodes.registerType('server', SentiloServerNode);
}
