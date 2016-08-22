

var nodes = function() {};



///ON EVENT
var socket = io();

socket.on('log', function(msg){
  $('#messages').append($('<li>').text(msg));
});

socket.on('drive ready', function (msg) {
});

socket.on('driver failed', function (msg) {
});

socket.on('scan complete', function (msg) {

});

socket.on('node added', function (msg) {
  nodes[msg.nodeid] = msg.node;
});

socket.on('node naming', function (msg) {
  var nodeid = msg.nodeid;
  var info = nsg.nodeinfo;
});

socket.on('node ready', function(msg){
    var id = msg.nodeid;
    nodes[id] = msg.node;
    printNode(id);
});

socket.on('node event', function (msg) {
});


socket.on('notification', function (msg) {
  if(nodes[nodeid]){
    nodes[nodeid].notific = msg.notif;
  }

});

socket.on('value edded', function (msg) {
  var nodeid = msg.nodeid;
  var comclass = msg.comclass;
  var value = msg.value;

  nodes[nodeid].characteristic[value.value_id] = value;
});

socket.on('value changed', function (msg) {

  if(nodes[msg.nodeid]){
    var nodeid = msg.nodeid;
    var comclass = msg.comclass;
    var value = msg.value;
    nodes[nodeid].characteristic[value.value_id] = value;
    console.log(nodes[nodeid].characteristic[value.value_id]);
  }
});

socket.on('value refreshed', function (msg) {
  var nodeid = msg.nodeid; var comclass = msg.comclass; var value = msg.value;
  nodes[nodeid].characteristic[value.value_id] = value;

  var d = new Date()
  var dd = d.getHours()+ ":" + d.getMinutes() + ":" + d.getSeconds() ;
  console.log('value refreshed: ' + dd + " " + value.node_id + " "+ value.label + " " +value.value);
});

socket.on('value removed', function (msg) {
  var nodeid = msg.nodeid; var comclass = msg.comclass; var value = msg.value;

  var value_id = nodeid + "-" + comclass + "-" + instance + "-" + index
  if(nodes[nodeid].characteristic[value_id])
      delete nodes[nodeid].characteristic[value_id];
});



///REST
function getNodes(result){
  $.get("/nodes", function(data, status){result(data, status); });
}

function setCharacteristicValue(node_id, value_id, value){
  $.get("/setCharacteristicValue/"+ node_id + "/" + value_id  +"/" + value, function(data, status){});
}

function setCharacteristicButton(node_id, value_id){
  $.get("/setCharacteristicButton/"+ node_id + "/" + value_id , function(data, status){});
}

function setName(node_id, name){
  $.get("/setName/"+ node_id + "/" + name , function(data, status){ });
}

function setLocation(node_id, location){
  $.get("/setLocation/"+ node_id + "/" + location , function(data, status){});
}


/* type = user/system/config/basic */
var getCharacteristicType = function(nodeid, type){
  return Characteristic = $.map(nodes[nodeid].characteristic , function( value, key ) {
    if(value.genre == type){
        return value;
    }
  });
}



///html
function printNodes(nodes){
  if(nodes){
    var i = 0;
    for(id in nodes){
      if(nodes[id] && nodes[id].ready){
        i++;
        $("#list1").last().append(printNode(id));
      }
    }
    console.log(i);
  }
}


function printNode(node_id){
  var node = nodes[node_id];
  var htmlNode = html_node(node_id, node.manufacturer, node.product, node.type, node.name, node.loc, node.notific);
  var html_car = printCharacteristicsType(node_id);
  return htmlNode;
}

function printCharacteristicsType(node_id){
  $("#node-val").empty();
  $("#list-user").empty();
  $("#list-system").empty();
  $("#list-config").empty();
  $("#list-basic").empty();

  $("#node-val").text(node_id + " " + nodes[node_id].name)
  $("#list-user").last().append(printAllCharacteristics(getCharacteristicType(node_id, "user")));
  $("#list-system").last().append(printAllCharacteristics(getCharacteristicType(node_id, "system")));
  $("#list-config").last().append(printAllCharacteristics(getCharacteristicType(node_id, "config")));
  $("#llist-basic").last().append(printAllCharacteristics(getCharacteristicType(node_id, "basic")));


}

function printAllCharacteristics(characteristics){
  var html = '';
    for(value_id in characteristics){
        html += printCharacteristic(characteristics[value_id]);
    }
  return html;
}

function printCharacteristic(characteristic){
  var html = "";
  switch (characteristic.type) {
    case 'bool':
        html =  html_char_bool(characteristic.label, characteristic.value);
      break;
    case 'list':
        html = html_char_list(characteristic.label, characteristic.value ,characteristic.values);
      break;
    case 'button':
        html = html_char_button(characteristic.label);
      break;
    case 'byte':
    case 'int':
    case 'short':
    case 'decimal':
    case 'string':
    case 'raw':
    default:
         html = html_char_text(characteristic.label, characteristic.value, characteristic.units, characteristic.read_only);
      break;
  }
  return html;

}




/////html///
function html_node(id, manufacturer, product, type, name, loc, notific){
    var html = '<li class="node1 row" id='+ id +'" onclick="printCharacteristicsType('+ id + ')">' +
      '<div class="col-md-1" id="id">'+ id + '</div>' +
      '<div class="col-md-2" id="manufacturer">' + manufacturer + '</div>' +
      '<div class="col-md-3" id="product">' + product + '</div>'+
      '<div class="col-md-2" id="type">'+ type + '</div>'+
      '<div class="col-md-2" id="name">' + name + '</div>'+
      '<div class="col-md-0" id="loc">'+ loc + '</div>' +
      '<div class="col-md-1" id="notification">'+ notific +'</div>'+

    '</li>';
    return html;
}

function html_char_bool(label, value){
  return '<li class="value"><div  class="label">'+ label + '</div> <input value='+value+'></input> <button>submit</button></li>';
}

function html_char_list(label, value ,values){
  var options = ''; var j = values;
  for (var i = 0; i < j.length; i++) {
      var selected = '';
      if(j== value) {selected = value}
       options += '<option '+ selected + ' value="' + j[i]+ '">' + j[i] + '</option>';
    }
  return '<li class="value"><div>'+ label + '</div> <select>'+  options + '</select></li>';
}

function html_char_button(label){
  return  '<li class="value"><button>'+ label + '</button></li>';
}

function html_char_text(label, value, units, read_only){
  var html = '';
  if(read_only){
    html = '<li class="value"><div class=""><div class="label">'+ label + '</div> <input readonly value='+value+'></input><div>'+ units + '</div></div></li>';
  }
  else {
    html = '<li class="value"><div class=""><div class="label">'+ label + '</div> <input value='+value+'></input><div>'+ units + '</div> <button>submit</button></div></li>';
  }
  return html;
}
////



//ready
$(document).ready(function() {
  getNodes(function(data){
    nodes = $.parseJSON(data);
    printNodes(nodes);
    //console.log(getCharacteristicType('22,'"user"));
  });
});
