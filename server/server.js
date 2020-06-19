module.exports = function(RED) {
    function SentiloServerNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.alias = config.alias;
        node.host = config.host;
        node.acceptUntrusted = config.acceptUntrusted;
    }

    RED.nodes.registerType('server', SentiloServerNode, {
        credentials: {
            apiKey: { type: 'password' }
        }
    });
}