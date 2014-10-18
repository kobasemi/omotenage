
// Get a stream for video and audio connection
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// conn: DataConnection
var peer = conn = null;
// here: Marker, poly: Polyline
var map, here, poly;

$(document).on('pageinit', '#ope-wind', function(e, data){
    // Setting the css parameter(height) for Google Maps canvas
    // If it's not setting, the canvas does not fully work
    $("#map_canvas").css("height", $(window).height());
    initmap();

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

    $("#accept").click(ready);
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
        // Send the path of CGI program to remote user
        var cgi_path = "cgi-bin/generate.cgi" + getparam();
        conn.send(cgi_path);
        console.log('sent cgi_path to ' + conn.peer);
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
    }).on('call', function(call){
            // Send my localStream
            call.answer(window.localStream);

            // Receive remote localStream
            call.on('stream', function(stream){
                // Setting the stream into video tag
                $("#partner-video").prop("src", URL.createObjectURL(stream));
            }).on('close', function(){
                $("#partner-video").prop("src", "");
            });
        }
    }).on('connection', function(connect){
        conn = connect;
        conn.on('open', function(){
            clearpoly();
        }).on('data', function(data){
            // Get a longitude and latitude that sent from remode user
            var pos = $.parseJSON(data);
            // Update the canvas with a new latlng
            updatemap(new google.maps.LatLng(pos.lat, pos.lng));
        }).on('close', function(err){
        }).on('error', function(err){
            alert(err.message);
        });
    }).on('close', function(){
    }).on('error', function(err){
        alert(err.message);
    });
}

// Get the value from the form
function getparam(){
    var name = $(':text[name="remote_name"]').val();
    var location = $(':text[name="location"]').val();
    var from = $(':text[name="input_from"]').val();
    var to = $(':text[name="input_to"]').val();
    var tmode = $(':radio[name="tmode"]:checked').val();
    var mode = "general";

    // parameter as encoded URL
    return "?name=" + name + "&location=" + location + "&from=" + from + "&to=" + to + "&tmode=" + tmode + "&mode=" + mode;
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
    })()
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
