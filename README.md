node-red-contrib-sentilo
========================

<div style="width: 100%; margin: 50px 0px 250px 0px; border: 0px;">
	<div style="width: 50%; float: left; text-align: center; v-align: top; border: 0px;">
		<a href="http://www.sentilo.io" target="_blank" title="www.sentilo.io" alt="www.sentilo.io" style="border: 0px;">
			<img src="http://www.sentilo.io/wordpress/wp-content/uploads/2013/11/ori_SENTILO_sol_negre.png" width="250px">
		</a>
	</div>
	<div style="width: 50%; float: left; text-align: center; v-align: top; border: 0px;">
		<a href="http://www.thingtia.cloud" target="_blank" title="http://www.thingtia.cloud" alt="http://www.thingtia.cloud" style="border: 0px;">
			<img src="http://www.thingtia.cloud/wp-content/uploads/2016/11/Logo-Thingtia-grande.png" width="250px">
		</a>
	</div>
</div>

## What is it?

***node-network-contrib-sentilo*** is a collection of nodes for [Node-RED](http://nodered.org) that brings you the possibility to connect to a [***Sentilo***](http://www.sentilo.io) or [***Thingtia***](http://www.thingtia.cloud) platform server in order to interact with your data in a simple way.


## Install
Run the following command in the root directory for your Node-RED install

    $ npm install node-red-contrib-sentilo

## Usage
There're three nodes into the collection that performs the basic actions over a Sentilo / Thingtia platform server: ``retrieve``, ``publish`` and ``subscribe`` to data and platform events.

### retrieve node
Retrieves data from the platform server. 
##### Data types
Possible data types to retrieve are: 
* **ALARM**
* **ALERT**
* **CATALOG**
* **DATA**
* **ORDER**
* **SUBSCRIBE**

Depending of data type, you will be able to fill some extra filter parameters, such like *limit* number of observations, of *from/to* observations publish dates.

##### input / output
This node must be triggered via an **inject node** as an input, and will retrieve the returned data as an output payload message.

### publish node
Publishes data to the Thingtia / Sentilo platform server.
##### Data types
You can publish data of types: 
* **ALERT**
* **CATALOG**
* **DATA**
* **ORDER**

Depending of the data type, you can inform the data value into a param config from node config page, or publish a body json message, injecting it via **inject node** *(please, note that the input payload message must follow the specification defined for each kind of service, into the [Sentilo/Thingtia API Services Documentation](http://www.sentilo.io/xwiki/bin/view/APIDocs/Services))*.

##### input / output
This node must be triggered via an **inject node** as an input (it could be empty, or will contains a JSON payload input message, depending of desired data input).

### subscribe node
Performs a subscription to the desired data type from a Sentilo/Thingtia platform server.
The data types to subscribes can be:
* **ALARM**
* **DATA**
* **ORDER**

The node will publish as output payload message the notification message from the Sentilo/Thingtia platform server. This notification message will follow the [Sentilo Subscription response specification](http://www.sentilo.io/xwiki/bin/view/APIDocs.Services/Subscription).

##### input / output
The **subscribe node** will be activated on Node-Red flows deployment, and will publish as an output the retrieved subscription notification messages.

## Related documentation

Please, feel free to look into the official Sentilo/Thingtia documentation to get more info:

* [Sentilo website](http://www.sentilo.io)
* [Thingtia website](http://www.thingtia.cloud)
* [Github repository](https://github.com/sentilo/node-red-contrib-sentilo)

## Revisions

* **0.1.3 (actual)**
  * Added one dependency
* **0.1.2**
  * Added catalog support to the publish node 
  * Modified the format of the response message in case of error in the connection to the platform, now the payload and the error message returned are shown 
* **0.1.1**
  * Fixed some errors in the connection and data processing
* **0.1.0**
  * First version