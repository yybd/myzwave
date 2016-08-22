/*
var nodes11 = {node1:[
  {

      name: 'חדר הורים',
      Switch: 'on',
      isLogin: 'login'
  },
  {
      name: 'חדר הורים',
      Switch: 'off',
      isLogin: 'logout'
  }

]};

var Nodes = {nodes:
  {


  }

}


*/

function getNodes(result){
  $.get("/nodes", function(data, status){
    result(data);
  });
}


$( document ).ready(function() {

  getNodes(function(data){
    nodes = $.parseJSON(data);
    mapNodes();
    loadDevices();
  });

  $("#bt3" ).click(function() {
    $("#messages").toggle();
  });

//console.log("ll");

});
///node.name
///node.classes.37.0-1.values
nodes1 = {nodes:[]};
nodes2 = {nodes:[]};
nodes3 = {nodes:[]};

function mapNodes(){

  while (nodes1.nodes.length > 0) {
      nodes1.nodes.pop();
  }
  while (nodes2.nodes.length > 0) {
      nodes2.nodes.pop();
  }

  $.map( nodes , function( value, key ) {
    //console.log('mapNodes');
      //2 bt
      if(value.ready){
        if(value.characteristic[value.id+ "-37-2-0"]){
          nodes2.nodes.push({id:value.id, name: value.name, Switch1: value.characteristic[value.id+ "-37-1-0"].value, Switch2: value.characteristic[value.id+ "-37-2-0"].value, value_id1: value.characteristic[value.id+ "-37-1-0"].value_id , value_id2: value.characteristic[value.id+ "-37-2-0"].value_id});
        }
        else {
          //1 bt
          if(value.characteristic[value.id+ "-37-1-0"]){
            nodes1.nodes.push({id:value.id, name: value.name, Switch: value.characteristic[value.id+ "-37-1-0"].value, value_id: value.characteristic[value.id+ "-37-1-0"].value_id});

          }
        }
      }



  });
//console.log(nodes1);
//console.log(nodes2);
  //var date = {node1:

}



function loadDevices() {
/*
  var date = {devices:
    $.map( nodes , function( value, key ) {
      return value;
    })
  };
*/
  $.get('node1.html', function(template) {
    var rendered = Mustache.render(template, nodes1);
    $('#list1').html(rendered);
    //console.log(rendered);

    $(".glyphicon-off").on("click", function(){
      if($(this).hasClass('true')){
        //offDevice($(this).attr('data-id'));
        //$(this).css('color','#000066');
        setCharacteristicValue( $(this).attr('data-id'),false);
        $('#messages').append($('<li>').text('off' ));
      }
      if($(this).hasClass('false')){
        //onDevice($(this).attr('data-id'));
          //$(this).css('color','#000066');
          setCharacteristicValue($(this).attr('data-id'),true);
        $('#messages').append($('<li>').text('on'));
      }
    });

    $(".node").on("click", function(){
      if($(this).hasClass('false')){
        //login($(this).attr('id'));
      }
    });


  });

  $.get('node2.html', function(template) {
    var rendered = Mustache.render(template, nodes2);
    $('#list2').html(rendered);
    //console.log(rendered);

    $(".glyphicon-off").on("click", function(){
      if($(this).hasClass('true')){
        //offDevice($(this).attr('data-id'));
        //$(this).css('color','#000066');
        setCharacteristicValue($(this).attr('data-id'),false);

        $('#messages').append($('<li>').text('off' ));
      }
      if($(this).hasClass('false')){
        //onDevice($(this).attr('data-id'));
          //$(this).css('color','#000066');
          setCharacteristicValue($(this).attr('data-id'),true);
        $('#messages').append($('<li>').text('on'));
      }
    });

    $(".node").on("click", function(){
      if($(this).hasClass('false')){
        //login($(this).attr('id'));
      }
    });


  });



}
