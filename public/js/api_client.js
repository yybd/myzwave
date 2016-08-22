/*
    nodes[nodeid]['manufacturer']
    nodes[nodeid]['manufacturerid']
    nodes[nodeid]['product']
    nodes[nodeid]['producttype']
    nodes[nodeid]['productid']
    nodes[nodeid]['type']
    nodes[nodeid]['name']
    nodes[nodeid]['loc']
    nodes[nodeid]['ready']
    nodes[nodeid]['classes'][comclass][index]


*/

var nodes = function() {};

/* type = user/system/config/basic */
var getCharacteristicType = function(nodeid, type){
  return Characteristic = $.map(nodes[nodeid].characteristic , function( value, key ) {
    if(value.genre == type){
        return value;
    }
  });
}






var log = "";

///on event
var socket = io();






socket.on('log', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on('drive ready', function (msg) {
  //msg.homeid;
});

socket.on('driver failed', function (msg) {
});

socket.on('scan complete', function (msg) {

});

socket.on('node event', function (msg) {
  //msg.nodeid;
  //msg.data;
});

socket.on('node ready', function(msg){
    var id = msg.nodeid;
    //console.log(id);
    nodes[id] = msg.node;
    //console.log(nodes[id]);
    praseNode(id);
    //valuesNode(id);

});

socket.on('node added', function (msg) {
  //msg.nodeid;
  var id = msg.nodeid;
  //console.log(id);
  nodes[id] = msg.node;
  //console.log(nodes[id]);
  praseNode(id);
});

socket.on('notification', function (msg) {
  //msg.nodeid;
  //msg.notif;
  mapNodes();
  loadDevices();
});

socket.on('value edded', function (msg) {
  var nodeid = msg.nodeid;
  var comclass = msg.comclass;
  var value = msg.value;
  /*
  if(nodes[nodeid]){
    if (!nodes[nodeid].classes[comclass])
          nodes[nodeid].classes[comclass] = {};
    nodes[nodeid].classes[comclass].instance[value.instance].index[value.index] = value;
  }
  */
  nodes[nodeid].characteristic[value.value_id] = value;

  //msg.nodeid;
  //msg.comclass;
  //msg.value;
  mapNodes();
  loadDevices();
});

socket.on('value changed', function (msg) {

  if(nodes[msg.nodeid]){
    var nodeid = msg.nodeid;
    var comclass = msg.comclass;
    var value = msg.value;
    //nodes[nodeid].classes[comclass].instance[value.instance].index[value.index] = value;
    nodes[nodeid].characteristic[value.value_id] = value;
    //var d = new Date()
    //var dd = d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() ;
    //console.log('value cheanged: ' + dd + " " + value.node_id + " "+ value.label + " " +value.value);
    console.log(nodes[nodeid].characteristic[value.value_id]);
    //console.log(msg);
    //$('#messages').append($('<li>').text(msg.value));

    mapNodes();
    loadDevices();
  }

  //msg.nodeid;
  //msg.comclass;
  //msg.value;
});

socket.on('value refreshed', function (msg) {
  var nodeid = msg.nodeid; var comclass = msg.comclass; var value = msg.value;
  //nodes[nodeid].classes[comclass].instance[value.instance].index[value.index] = value;
  nodes[nodeid].characteristic[value.value_id] = value;

  var d = new Date()
  var dd = d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() ;
  console.log('value refreshed: ' + dd + " " + value.node_id + " "+ value.label + " " +value.value);

  //msg.nodeid;
  //msg.comclass;
  //msg.value;
});

socket.on('value removed', function (msg) {
  var nodeid = msg.nodeid; var comclass = msg.comclass; var value = msg.value;
  /*
  if (nodes[nodeid]['classes'][comclass] &&
        nodes[nodeid]['classes'][comclass][index + "-" + instance])
        delete nodes[nodeid]['classes'][comclass][index + "-" + instance];
        */
  var value_id = nodeid + "-" + comclass + "-" + instance + "-" + index
  if(nodes[nodeid].characteristic[value_id])
      delete nodes[nodeid].characteristic[value_id]
  //msg.nodeid;
  //msg.comclass;
  //msg.value;
});





/*
function set_value(vid, value)
{
  //[node id, class, instance, index]
  var ids = vid.split("-")
  setValue(ids[0],ids[1],ids[2],ids[3] , value);
}

//set value
function setValue(nodeid, commandclass, instance, index, value) {
  //$.get("/setValue/"+ nodeid + "/" + commandclass + "/" + instance + "/" + index + "/" + value, function(data, status){});
  socket.emit('set value',{ nodeid: nodeid,  comclass: commandclass, instance:instance, index: index,  value:value});
  //socket.emit('set value','value');
  //console.log(nodeid + " " +commandclass + " " + instance+  " "  + index + " " + value);
  var d = new Date()
  var dd = d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() ;
  console.log("set value:" +dd + " " +  nodeid + " " +commandclass + " " + instance+  " "  + index + " " + value);

}

//(nodeid=3,commandclass=37,instance=1,index=0,value=true)
function setValue(nodeid, commandclass, instance, index, value){
  $.get("/setValue/"+ nodeid + "/" + commandclass + "/" + instance + "/" + index + "/" + value, function(data, status){});
}
*/

function setCharacteristicValue(value_id, value)
{
  var node_id = value_id.substring(0,value_id.indexOf("-"))
  //[node id, class, instance, index]
  $.get("/setCharacteristicValue/"+ node_id + "/" + value_id  +"/" + value, function(data, status){});
  //setValue(value_id , value);
}


function setCharacteristic_Value(node_id, value_id, value)
{
  //var node_id = value_id.subString(0,value_id.indexOf("-"))
  //[node id, class, instance, index]
  $.get("/setCharacteristicValue/"+ node_id + "/" + value_id  +"/" + value, function(data, status){});
  //setValue(value_id , value);
}

//connect
function connect1() {
  socket.emit('connect zwave');
  //console.log("gg");
}
function connect2() {
  //$.get("/connect", function(data, status){});
  //console.log("gg");
}
function disconnect() {
}















function getNodes(result){
  $.get("/nodes", function(data, status){result(data);});
}

/////

/////
$( document ).ready(function() {
  getNodes(function(data){
    nodes = $.parseJSON(data);

    if(nodes){
      //console.log(nodes);
      for(id in nodes){
        if(nodes[id]){
          //console.log(nodes[id]);
          praseNode(id);
          //valuesNode(id);
        }

      }
    }
    console.log(getCharacteristicType('3',"system"));
  });


/*
  $.get("/nodes", function(data, status){
    nodes = $.parseJSON(data);

    if(nodes){
      //console.log(nodes);
      for(id in nodes){
        if(nodes[id] && nodes[id]['ready']){
          //console.log(nodes[id]);
          praseNode(id);
          //valuesNode(id);
        }

      }
    }
  });
*/

});



///html func
function praseNode(id){
  var node = nodes[id];
  var html = '<tr onclick="clickNode('+ id + ')">' +
    '<td id="id">'+ id + '</td>' +
    '<td id="manufacturer">' + node.manufacturer + '</td>' +
    '<td id="product">' + node.product + '</td>'+
    '<td id="type">'+ node.type + '</td>'+
    '<td id="name">' + node.name + '</td>'+
    '<td id="loc">'+ node.loc + '</td>' +
    '<td id="notification">'+ node.notific +'</td>'+
    '<td id="value"><table id="val">' + HtmlSwitchValue(node) +'</table></td>' +
  '</tr>';

  $("#nodesTB").last().append(html);
}
/*
function valuesNode(id){
  var node = nodes[id];
  var values = [];

  for (comclass in node['classes']) {
    //var classvalues = node.classes[comclass];
    for (idx in node.classes[comclass]){
      var value = node.classes[comclass][idx];
      //console.log(value);
      values[value['class_id'] + "_" + value['index'] + "_" + value['instance']] = value;


    }
  }
  nodes[id]['values'] = values


  //console.log(nodes[id]['values']);
}
*/

function clickNode(id){
  var node  = nodes[id];
  $('#divconfigcur').empty();
  $('#divconfigcon').empty();
  $('#divconfiginfo').empty();
  for(value_id in node.characteristic){
    praseValue(node.characteristic[value_id]);
  }
}

function getSwitchValue(node){
  var switchValue = [];
  //for (comclass in node.classes) {
    //var classvalues = node.classes[comclass];
    for (values in node.characteristic){
      var value = node.characteristic[values];
      //console.log(value);
      switch (value['label']) {
        case "Switch":
        switchValue.push(value);
        break;
        case "Level":
        switchValue.push(value);
        break;
        case "Bright":
        switchValue.push(value);
        break;
        case "Dim":
        switchValue.push(value);
        break;
        case "Up":
        switchValue.push(value);
        break;
        case "Down":
        switchValue.push(value);
        break;
        case "Open":
        switchValue.push(value);
        break;
        case "Close":
        switchValue.push(value);
        break;
        }
    }
  //}

  return switchValue;
}

function HtmlSwitchValue(node){
  var v = getSwitchValue(node)
    //console.log(v);
    var html = "";
    for(vv in v){
      var value = v[vv];
      switch (value['type']) {
        case 'bool':
          html += CreateOnOff(value);
          break;
        case 'list':
          html += CreateList(value);
          break;
        case 'button':
          //html += CreateButton(value);
          break;
        case 'byte':
        case 'int':
        case 'short':
        case 'decimal':
        case 'string':
        case 'raw':
          html += CreateTextBox(value);
          break;
        default:
          html += CreateTextBox(value);


          break;
      }
    }
    return html;

}


function praseValue(value){
    var html = "";
    switch (value['type']) {
      case 'bool':
        html = CreateOnOff(value);
        break;
      case 'list':
        html = CreateList(value);
        break;
      case 'button':
        html = CreateButton(value);
        break;
      case 'byte':
      case 'int':
      case 'short':
      case 'decimal':
      case 'string':
      case 'raw':
        html = CreateTextBox(value);
        break;
      default:
        html = CreateTextBox(value);
        break;
    }
    switch (value['genre']) {
      case 'basic':
          $('#divconfigbas').append(html);
      case 'user':
        $('#divconfigcur').append(html);
        break;
      case 'config':
        $('#divconfigcon').append(html);
        break;
      case 'system':
        $('#divconfiginfo').append(html);
        break;
      }

}
//vid =id+'-'+cclass+'-'+genre+'-'+type+'-'+instance+'-'+index;

function CreateOnOff(value){
  var label = value['label'];
  var readonly = value['readonly'];
  var val = value['value'];
  var units = value['units'];
  var vid  = value['value_id'];
  var id = value['id'];

  var data='<tr class="onoff"  border="1">' +
              '<td style="float: right;">' +
                //if (value.help.length > 0)
                  //data=data+' onmouseover="ShowToolTip(\''+quotestring(value.help)+'\',0);" onmouseout="HideToolTip();"';
                '<label><span class="legend">'+ label + ":" + value['node_id'] + ':&nbsp;</span></label></td>' +
              '<td>' +
                  '<select id="'+ vid +'" onchange="setCharacteristicValue(this.id, JSON.parse(this.value))"';
                  if (readonly)
                    data=data+' disabled="true"';
                    data=data+'>';
                    //console.log(val);
                    //if (value.help.length > 0)
                      //data=data+' onmouseover="ShowToolTip(\''+quotestring(nodes[i].values[j].help)+'\',0);" onmouseout="HideToolTip();"';
                  if (val)
                    {data = data +'<option value="false">Off</option><option value="'+ val + '" selected="true">On</option>';}
                  if (!val)
                    {data = data +'<option value="'+ val + '" selected="true">Off</option><option value="true">On</option>';}
                  data = data +
                  '</select>'+
                '</td>'+
                '<td><span class="legend">'+units+'</span></td>'+
              '</tr>';
  return data;
}

function CreateTextBox(value){
  var label = value['label'];
  var readonly = value['readonly'];
  var val = value['value'];
  var units = value['units'];
  var vid  = value['value_id'];
  var id = value['id'];
  //console.log(value + " kk");
  var val=String(val).replace(/(\n\s*$)/, "");


  var data = '<tr  border="1"><td style="float: right;"';
  //if (nodes[i].values[j].help.length > 0)
    //data=data+' onmouseover="ShowToolTip(\''+quotestring(nodes[i].values[j].help)+'\',0);" onmouseout="HideToolTip();"';
  data=data+'><label><span class="legend">'+label+':&nbsp;</span></label></td><td>'+
  '<input type="text"  ondblclick="setCharacteristicValue(this.id, this.value)" class="legend" size="'+val.length+'" id="'+ vid +'" value="'+val+'"';
  //if (nodes[i].values[j].help.length > 0)
    //data=data+' onmouseover="ShowToolTip(\''+quotestring(nodes[i].values[j].help)+'\',0);" onmouseout="HideToolTip();"';

  if (readonly)
    data=data+' disabled="true">';
  else
    data=data+'></input>';
  //var evid = '$("'#'+ vid).attr("id")';
  //var vvid = '$("#"+ vid)).val()';
  data=data+'<span class="legend">'+units+'</span>';
  if (!readonly)
    data=data+'<button type="submit" onclick="">Submit</button>';
  data=data+'</td></tr>';
  return data;
}

function CreateList(value){
  var label = value['label'];
  var readonly = value['readonly'];
  var val = value['value'];
  var units = value['units'];
  var values = value['values'];//[]
  var vid  = value['value_id'];
  var id = value['id'];

  var data='<tr  border="1"><td style="float: right;"';
  //if (nodes[i].values[j].help.length > 0)
    //data=data+' onmouseover="ShowToolTip(\''+quotestring(nodes[i].values[j].help)+'\',0);" onmouseout="HideToolTip();"';
  data=data+'><label><span class="legend">'+label+':&nbsp;</span></label></td><td>'+
  '<select id="'+ vid +'" onchange="setCharacteristicValue(this.id, this.value)"';
  //if (nodes[i].values[j].help.length > 0)
    //data=data+' onmouseover="ShowToolTip(\''+quotestring(nodes[i].values[j].help)+'\',0);" onmouseout="HideToolTip();"';
  if (readonly)
    data=data+' disabled="true">';
  else
    data=data+'>';
  if (val != null)
    for (k=0; k<values.length; k++) {
        data=data+'<option value="'+values[k]+'"';
        if (values[k] == val){
          data=data+' selected="true"';
        }
        data=data+ '>' + values[k] + '</option>';
                                                                                                                                           data=data+'>'+val.item+'</option>';
    }

  data=data+'</select><span class="legend">'+units+'</span></td></tr>';
  return data;
}

function CreateButton(value){
  var label = value['label'];
  var readonly = value['readonly'];
  var units = value['units'];
  var vid  = value['value_id'];

  var data='<tr  border="1">'+
              '<td style="float: right;">'+
              //if (value.help.length > 0)
                  //data=data+' onmouseover="ShowToolTip(\''+quotestring(value.help)+'\',0);" onmouseout="HideToolTip();"';
                  '<label><span class="legend">'+label+':&nbsp;</span></label>'+
              '</td>'+
              '<td>'+
                '<button type="submit" id="" onclick="" onmousedown="" onmouseup=""'
                if (readonly)
                  data=data+' disabled="true"';
                  data=data+'>Submit</button>'+
              '</td>'+
              '<td><span class="legend">'+units+'</span></td>'+
            '</tr>';
  return data;
}








//connect
function connect() {
}
function disconnect() {
}




function setNodeOn(nodeid) {
}
function setNodeOff(nodeid) {
}
function setLevel(nodeid, level) {
}

//device metadata
function setNodeLocation(nodeid, location) {
}
function setNodeName(nodeid, name) {
}

//Polling a device
function enablePoll(nodeid, commandclass, intensity) {
}
function disablePoll(nodeid, commandclass) {
}
function setPollInterval(nodeid ) {
}
function getPollInterval() {
}
function isPolled() {
}
function setPollIntensity() {
}
function getPollIntensity() {
}

//Association groups management:
function getNumGroups(nodeid) {
}
function getGroupLabel(nodeid, group) {
}
function getAssociations(nodeid, group) {
}
function getMaxAssociations(nodeid, group) {
}
function addAssociation(nodeid, group, target_nodeid) {
}
function removeAssociation(nodeid, group, target_nodeid) {
}

//Resetting the controller
function hardReset() {
}
function softReset() {
}

//Scenes control:
function createScene(label) {
}
function removeScene(sceneId) {
}
function getScenes() {
}
function addSceneValue(sceneId, nodeId, commandclass, instance, index) {
  // add a zwave value to a scene
}
function removeSceneValue(sceneId, nodeId, commandclass, instance, index) {
  // remove a zwave value from a scene
}
function sceneGetValues(sceneId) {
}
function activateScene(sceneId) {
}

//ZWave network commands
function healNetworkNode(nodeId, doReturnRoutes) {
}
function healNetwork() {
}
function getNeighbors() {
}
function refreshNodeInfo(nodeid) {
}

//ZWave controller commands:
function beginControllerCommand( commandname, highPower, node1_id, node2_id ) {
  // begin an async controller command on node1:
}
function cancelControllerCommand() {
  // cancel controller command in progress
}
function getControllerNodeId() {
  // returns controller's node id
}
function getSUCNodeId() {
  // returns static update controller node id
}
function isPrimaryController() {
  // is the OZW-managed controller the primary controller for this zwave network?
}
function isStaticUpdateController() {
  // Query if the controller is a static update controller.
}
function isBridgeController() {
  // Query if the controller is using the bridge controller library.
}
function getLibraryVersion() {
  // Get the version of the Z-Wave API library used by a controller.
}
function getLibraryTypeName() {
  // Get a string containing the Z-Wave API library type used by a controller
}
function getSendQueueCount() {
  //
}

//Configuration commands:
function requestAllConfigParams(nodeId) {
}
function requestConfigParam(nodeId, paramId) {

}
function setConfigParam(nodeId, paramId, paramValue, paramValue) {
}
