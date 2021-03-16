node-red-contrib-sentilo
========================

<div style="width: 100%; margin: 50px 0px 250px 0px; border: 0px;">
	<div style="width: 50%; float: left; text-align: center; v-align: top; border: 0px;">
		<a href="https://www.sentilo.io" target="_blank" title="www.sentilo.io" alt="https://www.sentilo.io" style="border: 0px;">
			<img src="https://www.sentilo.io/wordpress/wp-content/uploads/2013/11/ori_SENTILO_sol_negre.png" width="250px">
		</a>
	</div>
	<div style="width: 50%; float: left; text-align: center; v-align: top; border: 0px;">
		<a href="https://www.thingtia.cloud" target="_blank" title="http://www.thingtia.cloud" alt="https://www.thingtia.cloud" style="border: 0px;">
			<img src="https://www.thingtia.cloud/wp-content/uploads/2016/11/Logo-Thingtia-grande.png" width="250px">
		</a>
	</div>
</div>

## What is it?

***node-network-contrib-sentilo*** is a collection of nodes for [Node-RED](http://nodered.org) that brings you the possibility to connect to a [***Sentilo***](http://www.sentilo.io) or [***Thingtia***](http://www.thingtia.cloud) platform server in order to interact with your data in a simple way.


## Install
Run the following command in the root directory for your Node-RED install

    $ npm install node-red-contrib-sentilo

## Usage
Package adds 4 nodes to the Node-RED's palette that provide basic interactions with a Sentilo / Thingtia platform server: ``retrieve``, ``publish`` and ``subscribe`` to data and platform events.

### Retrieve Node
Retrieves data from the platform server. 
##### Data types
Possible data types to retrieve are: 
* ALARM
* ALERT
* CATALOG
* DATA
* ORDER
* SUBSCRIBE

Depending of data type, you will be able to fill some extra filter parameters, such like *limit* number of observations, or *from/to* observations publish dates.

##### Input / output
This node must be triggered by plugging an **inject node** in the input. Node will output the returned Sentilo message as well as the HTTP status code, in two separate outputs.

### Publish Node
Publishes data to the Thingtia / Sentilo platform server.
##### Data types
You can publish data of types: 
* ALERT
* CATALOG
* DATA
* ORDER

##### Input / output
This node must be triggered via an **inject node** on the input (event might either be empty or might contain a JSON payload input message).
Node will output the returned Sentilo message (if any) as well as the HTTP status code, in two separate outputs.

### Subscribe With Endpoint node
Creates a HTTP endpoint that will use Sentilo to forward its event messages.
Your Node-RED instance has to be therefore reachable from your Sentilo instance. 
Also creates a subscription to a Sentilo/Thingtia platform server via API.
Possible data types are:
* ALARM
* DATA
* ORDER
This node is an all-in-one Sentilo subscription feature. It is ideal if you need to subscribe to single channel (be it one data type, one sensor, one provider etc).    


##### Input / output
No input - the Subscribe With Endpoint Node is activated on Node-Red flow deployment. At this moment it creates the HTTP endpoint, 
as well as it creates or re-creates the subscription. Outputs:
* First output returns the retrieved subscription notification messages.
* Second output returns Sentilo response message of the subscription creation call (executed only once on each deploy)
* Third output returns Sentilo HTTP status code of the subscription creation call (executed only once on each deploy)


### Subscribe Without Endpoint node
At a difference with the previous node, this node only creates a subscription to a Sentilo/Thingtia platform server via API.
Another HTTP have to be used as callback URL, for example "Http In" node of even "Subscribe With Endpoint".
Possible data types are:
* ALARM
* DATA
* ORDER
This node is created for bulk-manage the subscriptions. It can be parametrized by properties in the incoming msg object. 


##### Input / output
The Subscribe Without Endpoint Node has one input and expects given properties in the msg object. 
* First output returns Sentilo response message of the subscription creation call
* Second output returns Sentilo HTTP status code of the subscription creation call


## Related documentation

Please, feel free to look into the official Sentilo/Thingtia documentation to get more info:
* [Sentilo Documentation](https://sentilo.readthedocs.io/en/latest/)
* [Sentilo website](https://www.sentilo.io)
* [Thingtia website](https://www.thingtia.cloud)
* [Github repository](https://github.com/sentilo/node-red-contrib-sentilo)

## Revisions

* **0.3.0 (actual)**
  * Added the 'subscribe-without-endpoint' node
  * The 'subscribe' node renamed to 'subscribe-with-endpoint'
* **0.2.0**
  * Node-RED 1.0 compatibility
  * Fixed server configuration, allowing non-standard ports
  * All nodes get specific outputs with HTTP status of the Sentilo REST API call. Can be useful for handling errors.
* **0.1.5**
  * Solved some litle visual issues
* **0.1.4**
  * Added one dependency, that add support to old node.js versions
* **0.1.3**
  * Added one dependency
* **0.1.2**
  * Added catalog support to the publish node 
  * Modified the format of the response message in case of error in the connection to the platform, now the payload and the error message returned are shown 
* **0.1.1**
  * Fixed some errors in the connection and data processing
* **0.1.0**
  * First version