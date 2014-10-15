
$(document).on('pageinit', '#ope-wind', function(e, data){
    // Setting the css parameter(height) for Google Maps canvas
    // If it's not setting, the canvas does not fully work
    $("#map_canvas").css("height", $(window).height());
    // Initialize the map
    $('#map_canvas').gmap().bind('init', function(evt, map) {
        map.setOptions({
            // Center of Tokyo Station
            'center': new google.maps.LatLng(35.681382,139.766084),
            'zoom':15});
    });

    $("#accept").click(ready);
    $("#gene").click(generate);

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

// Get a stream for video and audio connection
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
var peer = null;
// Remote User Peer ID
var usr_id = "";

function ready(){
    // If a operator name is empty,
    // alert the dialog and exit this function
    if($('#input_name').val() === ''){
        alert("名前を入力してください(半角英数字)．");
        return;
    }

    // Open Media(Camera and Mic)
    navigator.getUserMedia({audio: true, video: true}, function(stream){
        window.localStream = stream;
    }, function(){
        console.log("You should enable the permit of Camera and Mic.\n" +
              "Please reload this page.\n");
    });

    // Change to disable this elements
    $("#accept").text("受付中");
    $("#accept").addClass("ui-state-disabled");
    $("#select_cc").selectmenu("disable");
    $("#input_name").textinput("disable");

    initpeer();

    $("#gene").click(function(){
        // TODO: ページ生成CGIの作成
        var page_url = "nav/" + usr_id + ".html";
    });

    $("#send").click(function(){
        // Send generated page to remote user
        //var conn = peer.connect(usr_id);
        //conn.send(page_url);
        console.log('send');
    });
}

// Initializing the peer,
// and then setting some callbacks
function initpeer(){
    // My Peer ID: {COUNTRY CODE}-{OPERATOR NAME}
    // e.g. us-mizho
    var my_id = $('#select_cc').val() + "-" + $('#input_name').val();

    // Open Peer with My Peer ID
    peer = new Peer(my_id, {key: APIKEY, debug:3});

    peer.on('open', function(){
        peer.on('call', function(call){
            // Get remote user id
            usr_id = call.peer;
            // Send my localStream
            call.answer(window.localStream);

            initcall(call);
        }).on('connection', function(conn){
            initconn(conn);
        }).on('close', function(){
            $("#pertner-video").prop("src", "");
            alert("Closed...");
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

// Initializing MediaConnection callbacks
function initcall(call){
    // NOTE: MediaConnection object does not have 'open' callback function...
    call.on('stream', function(stream){
        // Receive remote localStream
        // Setting the stream into video tag
        $("#pertner-video").prop("src", URL.createObjectURL(stream));
    });
}

// Initializing DataConnection callbacks
function initconn(conn){
    conn.on('open', function(){
        conn.on('data', function(data){
            // Get a longitude and latitude that sent from remode user
            var pos = $.parseJSON(data);
            // Update the canvas with a new latlng
            updateMap(new google.maps.LatLng(pos.lat, pos.lng));
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

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

function generate(){
    // Generate page
    //var page_url = "nav/" + remote_id + ".html";

    var remote_id = "test1";

    // Get value from input form using jQuery
    var name = $(':text[name="remote_name"]').val();
    var location = $(':text[name="location"]').val();
    var from = $(':text[name="input_from"]').val();
    var to = $(':text[name="input_to"]').val();
    var tmode = $(':radio[name="tmode"]:checked').val();

    var s = document.createElement('script');
    var param = "?name=" + name + "&location=" + location + "&from=" + from + "&to=" + to + "&tmode=" + tmode + "&remote_id=" + remote_id;
    s.src = 'cgi-bin/generate.cgi' + param;
    document.body.appendChild(s);
    return false;
}

// Callback from python script which generate a page
function callback(json) {
    url = json.url;
    alert(url);
}
