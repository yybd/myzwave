var events  = require('events'),
    util    = require('util'),
    OZW = require('openzwave-shared');
    //Node = require('./node');

var notification = {0: "message complete", 1:"timeout", 2:"nop",3:"node awake",4:"node sleep" , 5:"node dead", 6:"node alive"};

var Node = function(id) {
      var self = this;
      //self.ozw = ozw;
      self.id = id,
      self.manufacturer = '',
      self.manufacturerid = '',
      self.product = '',
      self.producttype = '',
      self.productid = '',
      self.type = '',
      self.name = '',
      self.loc = '',
      self.classes = {}, //{[comclass][index][instance][value]}
      self.characteristic = {},//{[value_id = {}]}
      self.data = '',
      self.available = false,
      self.ready = false,
      self.notific = ''
    };

//var devices = [];

///CLASS zwave : zwave.nodes
var zwave = function(){
  var self = this;
  if (!(self instanceof zwave)) return new zwave();

  self.nodes = {};
  self.homeid = '';
  self.driver = '/dev/ttyUSB0';
  self.ozw = new OZW({
      Logging: false,     // disable file logging (OZWLog.txt)
      ConsoleOutput: true // enable console logging
  });
  self.conected = false;
  self.scanComplete = false;

  //EVENTS network
  self.ozw.on('driver ready', function(homeid) {
    self.homeid = homeid;
  });

  self.ozw.on('connect',function(msg){
    self.conected = true;
  });

  self.ozw.on('disconnect',function(msg){
    self.conected = false;
  });

  self.ozw.on('scan complete', function() {
    self.scanComplete = true;
  });

  //EVENTS NODE
  self.ozw.on('node added', function(nodeid) {
    self.nodes[nodeid] = new Node (nodeid); //edd node
  });

  self.ozw.on('node naming', function (nodeid, nodeinfo) {
    self.nodes[nodeid].name = nodeinfo.name;
  });

  self.ozw.on('node available', function (nodeid, nodeinfo) {
    self.nodes[nodeid].available = true;
  });

  self.ozw.on('node ready', function(nodeid, nodeinfo) {
      var node = self.nodes[nodeid];

      node.manufacturer = nodeinfo.manufacturer;
      node.manufacturerid = nodeinfo.manufacturerid;
      node.product  = nodeinfo.product;
      node.producttype  = nodeinfo.producttype;
      node.productid  = nodeinfo.productid;
      node.type  = nodeinfo.type;
      node.name  = nodeinfo.name;
      node.loc  = nodeinfo.loc;
      node.ready  = true;
      node.notific = "ready";
  });

  self.ozw.on('node event', function(nodeid, data) {
    self.nodes[nodeid].data = data;
  });

  self.ozw.on('notification', function(nodeid, notif) {
      if(self.nodes[nodeid]){
            self.nodes[nodeid].notific = notification[notif];
        }
  });


  //EVENS VALUE NODE
  self.ozw.on('value added', function(nodeid, comclass, value) {
    var node = self.nodes[nodeid];
    node.characteristic[value.value_id] = value;
  });

  self.ozw.on('value changed', function(nodeid, comclass, value) {
    var node = self.nodes[nodeid];
    node.characteristic[value.value_id] = value;
  });

  self.ozw.on('value refreshed', function(nodeid, comclass, value) {
    var node = self.nodes[nodeid];
    node.characteristic[value.value_id] = value;
  });

  self.ozw.on('value removed', function(nodeid, comclass, instance, index) {
    var node = self.nodes[nodeid];
    var value_id = nodeid + "-" + comclass + "-" + instance + "-" + index
    if(node.characteristic[value_id])
      delete node.characteristic[value_id]
  });

};


util.inherits(zwave, events.EventEmitter);

module.exports = zwave;
