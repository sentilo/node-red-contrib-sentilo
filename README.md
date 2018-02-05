node-red-contrib-sentilo
========================

A [Node-RED](http://nodered.org) node collection used to retrieve, publish and subscribe data from/to **Sentilo/Thingtia Platform Server**.

## Install
Run the following command in the root directory for your Node-RED install

    $ npm install node-red-contrib-sentilo

## Usage

There're three nodes that performs the basic actions over a Sentilo/Thingtia platform server.

### retrieve
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

### publish
Publishes data to the Thingtia / Sentilo platform server.
##### Data types
You can publish data of types: 
* **ALERT**
* **DATA**
* **ORDER**

Depending of the data type, you can inform the data value into a param config from node config page, or publish a body json message, injecting it via **inject node** *(please, note that the input payload message must follow the specification defined for each kind of service, into the [Sentilo/Thingtia API Services Documentation](http://www.sentilo.io/xwiki/bin/view/APIDocs/Services))*.

##### input / output
This node must be triggered via an **inject node** as an input (it could be empty, or will contains a JSON payload input message, depending of desired data input).

#### subscribe
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