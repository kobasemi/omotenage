$(document).on('pageinit', '#ope-wind', function(e, data){
    // Setting the css parameter(height) for Google Maps canvas
    // If it's not setting, the canvas does not fully work
    $("#map_canvas").css("height", $(window).height());
    $("#accept").click(ready);

    // Create supported country selectmenu
    $.getJSON("SupportCountry.json", function(data){
        // Read supported country in JSON file
        $.each(data.support, function(idx, json){
            // Create the country option
            var cc = $('<option value="'+json.cc+'">'+json.jname+'</option>');
            $("#select_cc").append(cc);
            $("#select_cc").selectmenu("refresh");
        });
    });
});

/* WEBRTC */
// Get a stream for video and audio connection
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// Skyway API key for the domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
var peer = null;

function ready(){
    // Country Code
    var cc = $('#select_cc').val();
    // Operater Name
    var name = $('#input_name').val();

    // If name is empty, alert the dialog and exit this function
    if(name === ''){
        alert("名前を入力してください(半角英数字)．");
        return;
    }

    // Open Media(Camera and Mic)
    navigator.getUserMedia({audio: true, video: true}, function(stream){
        window.localStream = stream;
    }, function(){
        alert("You should enable the permit of Camera and Mic.\n" +
              "Please reload this page.\n");
    });

    // My ID: country code + operator name
    var myId = cc + "-" + name;
    var remote_id = "";

    // Change to disable this elements
    $("#accept").text("受付中");
    $("#accept").addClass("ui-state-disabled");
    $("#select_cc").selectmenu("disable");
    $("#input_name").textinput("disable");

    // Open Peer
    peer = new Peer(myId, {key: APIKEY, debug:3});

    peer.on('open', function(){
        console.log('Peer ID is: ' + myId);
    });
    peer.on('call', function(call){
        // Get remote id
        remote_id = call.peer;

        // Send my localStream
        call.answer(window.localStream);
        // Receive remote localStream
        call.on('stream', function(stream){
            // Setting the stream into video tag
            $("#pertner-video").prop("src", URL.createObjectURL(stream));
        });
    });
    peer.on('connection', function(conn){
        conn.on('data', function(data){
            // Get a longitude and latitude that sent from remode user
            var pos = $.parseJSON(data);
            // Update the canvas with a new latlng
            updateMap(new google.maps.LatLng(pos.lat, pos.lng));
        });
    });
    peer.on('close', function(){
        $("#pertner-video").prop("src", "");
        alert("Closed...");
    });

    $("#gene").click(function(){
        // TODO: ページ生成CGIの作成
        var page_url = "nav/" + remote_id + ".html";

        $("#send").click(function(){
            // Send generated page to remote user
            //var conn = peer.connect(remote_id);
            //conn.send(page_url);
            console.log('send');
        });
    });
}

/* Google Maps API */
// Initialize the map
$('#map_canvas').gmap().bind('init', function(evt, map) {
    map.setOptions({
        // Center of Tokyo Station
        'center': new google.maps.LatLng(35.681382,139.766084),
        'zoom':15});
});

var path= []; // For move route of remote user

// Update the map from a remote user's position of current
// latlng: latitude and longitude of the current position
function updateMap(latlng){

    // Clear marker of previous position
    $('#map_canvas').gmap('clear', 'markers');
    // Add marker of current position
    $('#map_canvas').gmap('addMarker', {'position': latlng});

    // Push current position to path array
    path.push(latlng);

    // Shape path array into polyline
    $('#map_canvas').gmap('addShape', 'Polyline', {
        'strokeWeight': 10,
        'strokeColor': '#FF0000',
        'strokeOpacity': 0.8,
        'path': path,
    });

    // Make a center of current position in map
    $('#map_canvas').gmap('get', 'map').panTo(latlng);
}
