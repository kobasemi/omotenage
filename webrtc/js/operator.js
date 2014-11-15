
// Get a stream for video and audio connection
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// conn: DataConnection, call: MediaConnection
var peer = conn = call = null;
// here: Marker, poly: Polyline
var map, here, poly;
// whether or not connectable me
var connectable = true;

$(document).on('pageinit', '#ope-wind', function(e, data){
    // Setting the css parameter(height) for Google Maps canvas
    // If it's not setting, the canvas does not fully work
    $("#map_canvas").css("height", $(window).height());
    initmap();

    // Create supported country selectmenu
    $.getJSON("json/SupportCountry.json", function(data){
        // Read supported country in JSON file
        $.each(data.support, function(idx, json){
            // Create the country option
            var cc = $('<option id="'+json.lc+'" value="'+json.cc+'">'+json.name+'</option>');
            $("#select_cc").append(cc);
            $("#select_cc").selectmenu("refresh");
        });
    });

    // Create country picker
    $.getJSON("json/Countries.json", function(data){
        // Read country list in JSON file
        $.each(data, function(idx, json){
            // Create the country option
            var cc = $('<option value="'+json.cc+'">'+json.name+'</option>');
            $("#countries").append(cc);
            $("#countries").selectmenu("refresh");
        });
    });

    $("#accept").click(ready);
    $("#send").addClass('ui-disabled');

    // Validation
    $("#profile").validationEngine();
    // Geocomplete
    $(".geocomplete").geocomplete();
});

function ready(){
    // If a operator name is empty,
    // alert the dialog and exit this function
    if($('#input_name').val() === ''){
        alert("名前を入力してください(半角英数字)．");
        return;
    }

    initpeer();

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

    $("#send").click(function(){
        if(!$("#profile").validationEngine('validate'))
            // Validation is not completely
            return;
        // Send the formatting parameters in JSON to remote user
        if(conn.open){
            conn.send(getparam());
            console.log('sent ' + conn.peer);
        }
    });
}

// Initializing the peer,
// and then setting some callbacks
function initpeer(){
    // My Peer ID: {COUNTRY CODE}-{OPERATOR NAME}
    // e.g. us-mizho
    var my_id = "ope-" + $('#select_cc').val() + "-" + $('#input_name').val();

    // Open Peer with My Peer ID
    peer = new Peer(my_id, {key: APIKEY, debug:3});
    peer.on('open', function(){
    }).on('call', function(ca){
        // If a operator is connected a client,
        // drop a new MediaConnection request
        if(call === null || !call.open){
            call = ca;

            // Send my localStream
            call.answer(window.localStream);
            // Receive remote localStream
            call.on('stream', function(stream){
                // Setting the stream into video tag
                $("#partner-video").prop("src", URL.createObjectURL(stream));
            }).on('close', function(){
                $("#partner-video").prop("src", "");
                connectable = true;
                $("#accept").text("受付中");
            });
            connectable = false;
            $("#accept").text("接続中");
        }
    }).on('connection', function(connect){
        if(connect.metadata === 'multicast'){
            // Receive a connect request
            if(connectable)
                // If I am connectable,
                // send my id to a remote user
                peer.connect(connect.peer, {metadata: peer.id});
            return;
        }

        // If a operator is connected a client,
        // drop a new DataConnection request
        if(conn === null || !conn.open){
            conn = connect;
            // Send Data Format
            conn.serialization= 'json';
            conn.on('open', function(){
                clearpoly();
            }).on('data', function(data){
                // Get a longitude and latitude that sent from remote user
                var pos = $.parseJSON(data);
                // Update the canvas with a new latlng
                updatemap(new google.maps.LatLng(pos.lat, pos.lng));
            }).on('close', function(err){
            }).on('error', function(err){
                alert(err.message);
            });
            $("#send").removeClass('ui-disabled');
        }
    }).on('close', function(){
    }).on('error', function(err){
        alert(err.message);
    });
}

// Get the value from the form and
// Return formatting in JSON
function getparam(){
    return JSON.stringify({
        "name"    : $(':text[name="remote_name"]').val(),
        "cc"      : $('#countries').val(),
        "location": $(':text[name="location"]').val(),
        "from"    : $(':text[name="input_from"]').val(),
        "to"      : $(':text[name="input_to"]').val(),
        "tmode"   : $(':radio[name="tmode"]:checked').val(),
        "lc"      : $('#select_cc option:selected').attr('id')
    });
}

// Initialize the MAP
function initmap(){
    // Create Map Object
    var map_ops = {
        center: new google.maps.LatLng(35, 135),
        zoom: 20,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById('map_canvas'), map_ops);

    // Create Polyline Object
    var poly_ops = {
        'strokeWeight': 10,
        'strokeColor': '#FF0000',
        'strokeOpacity': 0.8,
        'map': map
    }
    poly = new google.maps.Polyline(poly_ops);
}

// Clear a polyline
function clearpoly(){
    (function(undefined){
        if(poly !== undefined){
            // If a previous polyline existing
            poly.setMap(null);
            poly.getPath().clear();
        }
        poly.setMap(map);
    })();
}

// Update the map from a remote user's position of current
// latlng: latitude and longitude of the current position
function updatemap(latlng){
    // Add a line
    var path = poly.getPath();
    path.push(latlng);

    // Clear previous marker, and then
    // Set new marker
    (function(undefined){
        if(here !== undefined)
            here.setMap(null);
    })();
    here = new google.maps.Marker({
        position: latlng,
        icon: './img/here.png',
        map: map
    });

    map.panTo(latlng);
}
