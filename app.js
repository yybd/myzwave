require("string-format-js");
var app = require('express')();
var express = require("express");
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ZWAVE = require('./zwave');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


var ControllerState = {0:"ControllerState_Normal",1:"ControllerState_Starting",2:"ControllerState_Cancel",3:"ControllerState_Error",4:"ControllerState_Waiting",5:"ControllerState_Sleeping",6:"ControllerState_InProgress",7:"ControllerState_Completed",8:"ControllerState_Failed",9:"ControllerState_NodeOK",10:"ControllerState_NodeFailed"}

var zwave = new ZWAVE();

//REST API & io.emit api//

///emit event to client///
zwave.ozw.on('connect',function(msg){
    console.log('connect');
    io.emit('log',msg);
    io.emit('connect',"connecting to " + driver);
});

zwave.ozw.on('disconnect',function(msg){
    console.log('disconnect');
    io.emit('log',msg);
    io.emit('disconnect',"disconnecting ...");
});

zwave.ozw.on('driver ready',function(homeid){
  console.log('driver ready');
  io.emit('driver ready', { homeid: homeid });
  io.emit('log','scanning homeid=0x%s...'.format( homeid.toString(16)));
});

zwave.ozw.on('driver failed',function(){
  console.log('failed to start driver');
  io.emit('driver failed',  'driver failed');
  io.emit('log','failed to start driver');
});

zwave.ozw.on('scan complete',function(){
  io.emit('scan complete', 'scan complete' );
  io.emit('log','====> scan complete');
});

//controller event//
zwave.ozw.on('controller command',function(nodeId, ctrlState, ctrlError, helpmsg){
  io.emit('controller command',   { nodeid: nodeId, state: ctrlState, error:ctrlError, msg:helpmsg } );
  io.emit('log','controller commmand feedback: msg: %s | node: %d | error: %s | state: %s'.format(helpmsg, nodeId, ctrlError, ctrlState) );
});

//node event//
zwave.ozw.on('node added',function(nodeid){
  io.emit('node added', { nodeid: nodeid, node: zwave.nodes[nodeid] });
  io.emit('log','node%d added'.format( nodeid));
});

zwave.ozw.on('node naming',function(nodeid, nodeinfo){
  io.emit('node naming', { nodeid: nodeid, nodeinfo: nodeinfo });
  io.emit('log','node%d naming: name="%s"'.format( nodeid, nodeinfo.name));
});

zwave.ozw.on('node available',function(nodeid, nodeinfo){
  io.emit('node available', { nodeid: nodeid, nodeinfo: nodeinfo });
  io.emit('log','node%d is now available, but maybe not ready'.format( nodeid));
});

zwave.ozw.on('node ready',function(nodeid, nodeinfo){
  io.emit('log','node%d ready: %s, %s'.format( nodeid,
          nodeinfo.manufacturer ? nodeinfo.manufacturer : 'manufacturer id=' + nodeinfo.manufacturerid,
          nodeinfo.product ? nodeinfo.product : 'product id=' + nodeinfo.productid + ',product type=' + nodeinfo.producttype));
  io.emit('log','node%d info:  name="%s", type="%s", location="%s"'.format(nodeid,nodeinfo.name, nodeinfo.type, nodeinfo.loc));
  io.emit('node ready', { nodeid: nodeid, node: zwave.nodes[nodeid] });
});

zwave.ozw.on('node event',function(nodeid, data){
  io.emit('node event', { nodeid: nodeid, data: data });
  io.emit('log','node%d event: Basic set %d'.format( nodeid, data));
});

zwave.ozw.on('notification',function(nodeid, notific){
  io.emit('notification', {nodeid: nodeid, notif: notific});
  io.emit('log','node%d notification: %s'.format( nodeid, notific));
});

///value event//
zwave.ozw.on('value added',function(nodeid, comclass, value){
  io.emit('value added', { nodeid: nodeid,  comclass: comclass, value: value})
});

zwave.ozw.on('value changed',function(nodeid, comclass, value){
  if (zwave.nodes[nodeid]['ready']) {
        io.emit('value changed', { nodeid: nodeid,  comclass: comclass, value: value});
        io.emit('log','node%d: changed: %d:%s:%s->%s'.format( nodeid, comclass, value.label,zwave.nodes[nodeid].characteristic[value.value_id].value, value.value));
    }
});

zwave.ozw.on('value refreshed',function(nodeid, comclass, value){
  if (zwave.nodes[nodeid]['ready']) {
        io.emit('value refreshed', { nodeid: nodeid,  comclass: comclass, value: value});
        io.emit('log','node%d: refreshed: %d:%s:%s->%s'.format( nodeid, comclass,value['label'], zwave.nodes[nodeid].characteristic[value.value_id].value, value['value']));
        }
});

zwave.ozw.on('value removed',function(nodeid, comclass, instance, index){
  io.emit('value removed', { nodeid: nodeid,  comclass: comclass, index: index });
});




///API REST///
app.get('/connect',function(req, res){
  if(!zwave.conected){
    console.log("start..");
    zwave.ozw.connect(zwave.driver);
    zwave.conected = true;
  }
  res.send("send connect");
});

app.get('/disconnect',function(req, res){
  zwave.ozw.disconnect(zwave.driver);
  zwave.conected = false;
  console.log("disconnect..");
  res.send("send disconnect");
});


app.get('/hardReset',function(req, res){
    zwave.ozw.hardReset(); //
    res.send("send hard Reset");
});

app.get('/softReset',function(req, res){
    zwave.ozw.softReset(); //
    res.send("send soft Reset");
});


//network commands
app.get('/healNetworkNode/:nodeid',function(req, res){
    zwave.ozw.healNetworkNode(req.params.nodeid, false); //doReturnRoutes false
    res.send("send heal Network Node");
});
app.get('/healNetwork',function(req, res){
    zwave.ozw.healNetwork(); //
    res.send("send heal Network");
});

//Controller Commands
app.get('/addNode',function(req, res){
    zwave.ozw.addNode(false); //Add a new device or controller with/without security
    res.send("send add Node");
});

app.get('/removeNode',function(req, res){
    zwave.ozw.removeNode(); //Remove a device or controller from the Z-Wave network
    res.send("send remove Node");
});

app.get('/removeFailedNode/:nodeid',function(req, res){
    zwave.ozw.removeFailedNode(req.params.nodeid); //Remove a specific failed node from the controller's memory
    res.send("send remove Failed Node");
});

app.get('/hasNodeFailed/:nodeid',function(req, res){
    zwave.ozw.hasNodeFailed(req.params.nodeid); //Check whether a node is in the controller's failed nodes list
    res.send("send has Node Failed");
});

/*
zwave.requestNodeNeighborUpdate(nodeid)// Get a node to rebuild its neighbour list
zwave.assignReturnRoute(nodeid)// Assign a network return routes to a device
zwave.deleteAllReturnRoutes(nodeid)// Delete all return routes from a device
zwave.sendNodeInformation(nodeid)// Send a node information frame
zwave.createNewPrimary()//Add a new controller to the Z-Wave network. Used when old primary fails. Requires SUC.
zwave.receiveConfiguration()// Receive Z-Wave network configuration information from another controller
zwave.replaceFailedNode(nideid)// Replace a non-responding node with another. The node must be in the controller's list of failed nodes for this command to succeed.
zwave.transferPrimaryRole()//Make a different controller the primary
zwave.requestNetworkUpdate(nodeid)//Request network information from the SUC/SIS.
zwave.replicationSend(nodeid)//Send information from primary to secondary
zwave.cancelControllerCommand();// cancel controller command in progress

//info controller
zwave.getControllerNodeId();// returns controller's node id
zwave.getSUCNodeId();// returns static update controller node id
zwave.isPrimaryController();// is the OZW-managed controller the primary controller for this zwave network?
zwave.isStaticUpdateController();// Query if the controller is a static update controller.
zwave.isBridgeController();// Query if the controller is using the bridge controller library.
zwave.getLibraryVersion();// Get the version of the Z-Wave API library used by a controller.
zwave.getLibraryTypeName();// Get a string containing the Z-Wave API library type used by a controller
zwave.getSendQueueCount();//

//Configuration commands
zwave.requestAllConfigParams(nodeId);
zwave.requestConfigParam(nodeId, paramId);
zwave.setConfigParam(nodeId, paramId, paramValue, <sizeof paramValue>);
*/

//node command
app.get('/setCharacteristicValue/:nodeid/:value_id/:value',function(req, res){
  try {var ids = req.params.value_id.split("-")} catch(err) {}
  zwave.ozw.setValue(ids[0],ids[1],ids[2],ids[3] , JSON.parse(req.params.value));
  res.send('set value to:' + zwave.nodes[req.params.nodeid].characteristic[req.params.value_id].value_id);
});

app.get('/pressButton/:nodeid/:value_id',function(req, res){
  zwave.ozw.pressButton(req.params.value_id);
  res.send('set value to:' + zwave.nodes[req.params.nodeid].characteristic[req.params.value_id].value_id);
});

app.get('/setName/:nodeid/:name',function(req, res){
  zwave.ozw.setNodeName(req.params.nodeid, req.params.name);
  res.send("send new name");
});

app.get('/setLocation/:nodeid/:location',function(req, res){
  zwave.ozw.setNodeLocation(req.params.nodeid, req.params.location);
  res.send("send new location");
});

app.get('/createButton/:nodeid/:buttonid',function(req, res){
  zwave.ozw.createButton(req.params.nodeid, req.params.buttonid);
  res.send("create Button");
});

app.get('/deleteButton/:nodeid/:buttonid',function(req, res){
  zwave.ozw.deleteButton(req.params.nodeid, req.params.buttonid);
  res.send("delete Button");
});

app.get('/refreshNodeInfo/:nodeid',function(req, res){
  zwave.ozw.refreshNodeInfo(req.params.nodeid);
  res.send("refresh Node Info");
});

/*
//poll commands
zwave.ozw.enablePoll(nodeid, commandclass, intensity);
zwave.ozw.disablePoll(nodeid, commandclass);
zwave.ozw.setPollInterval(nodeid, )
zwave.ozw.getPollInterval();
zwave.ozw.isPolled();
zwave.ozw.setPollIntensity();
zwave.ozw.getPollIntensity();

//grup commands
zwave.ozw.getNumGroups(nodeid);
zwave.ozw.getGroupLabel(nodeid, group);
zwave.ozw.getAssociations(nodeid, group);
zwave.ozw.getMaxAssociations(nodeid, group);
zwave.ozw.addAssociation(nodeid, group, target_nodeid);
zwave.ozw.removeAssociation(nodeid, group, target_nodeid);

//scene commands
zwave.ozw.createScene(label);   // create a scene and assign a label, return its numeric id.
zwave.ozw.removeScene(sceneId); // perform #GRExit
zwave.ozw.getScenes();          // get all scenes as an array
// add a zwave value to a scene
zwave.ozw.addSceneValue(sceneId, nodeId, commandclass, instance, index);
// remove a zwave value from a scene
zwave.ozw.removeSceneValue(sceneId, nodeId, commandclass, instance, index);
zwave.ozw.sceneGetValues(sceneId); // return array of values associated with this scene
zwave.ozw.activateScene(sceneId);  // The Show Must Go On...
*/



//get node object
app.get('/zwave',function(req, res){
    res.send(JSON.stringify(zwave));
});

app.get('/nodes',function(req, res){
    res.send(JSON.stringify(zwave.nodes));
});

app.get('/getCharacteristic/:nodeid',function(req, res){
    res.send(JSON.stringify(zwave.nodes[req.params.nodeid].characteristic));
});

app.get('/getCharacteristicValue/:nodeid/:value_id',function(req, res){
  //res.send(JSON.stringify(zwave.nodes[req.params.nodeid].characteristic[req.params.value_id].value));
});






//conected
if(!zwave.conected){
  zwave.ozw.connect(zwave.driver);
  zwave.conected = true;
}

//disconnect
process.on('SIGINT', function() {
      console.log('disconnecting...');
      zwave.disconnect(zwave.driver);
      process.exit();
});

////API socket io
io.on('connection', function(socket){
  console.log('a user connected');

});







http.listen(3000, function(){
  console.log('listening on *:3000');
});
