
// Get a stream for video and audio connection
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// Operator Peer ID
var ope_id = "";
// conn: DataConnection, call: MediaConnection
var peer = conn = call = null;
// Image for Operator Body and Tie
var ope_svg = tie_svg =  "";

$(document).on('pageinit', '#pick-wind', function(e, data){
    $.get('./img/body.svg', function(svg){
        ope_svg = svg;
    }, 'text');

    initpeer();

    $('#call').click(function(){
        if(ope_id === ""){
            alert('Nobody is a selected operator');
            return;
        }

        navigator.getUserMedia({audio: true, video: true}, function(stream){
            window.localStream = stream;
            makecall();
            $.mobile.changePage("#call-wind");
        }, function(){
            alert('The media(camera, mic) are off');
        });
    });
});

$(document).on('pageinit', '#call-wind', function(e, data){
    /*
    if(peer === null)
        $.mobile.changePage("#pick-wind");
        */

    $("#partner-video").css("height", $(window).height()/2-50);
    $("#map_canvas").css("height", $(window).height()/2);
    $("#nicenav").hide();

    $('#endcall').click(function(){
        call.close();
        conn.close();
        peer.disconnect();
        peer.destroy();
        peer = call = conn = null;
    });

    makeconn();
});

$(document).on('pageshow', '#call-wind', function(e, data){
    var path= []; // For the move route of remote user
    // Generate a map and mark the map with user current position
    $('#map_canvas').gmap('watchPosition', function(position, status){
        if(status === 'OK'){
            // Get latlng of user current position
            var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            // Clear marker of previous position
            $('#map_canvas').gmap('clear', 'markers');
            // Add marker of current position
            $('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': true});
            // Push current position to path array
            path.push(clientPosition);

            // Shape path array into polyline
            $('#map_canvas').gmap('addShape', 'Polyline', {
                'strokeWeight': 10,
                'strokeColor': '#FF0000',
                'strokeOpacity': 0.8,
                'path': path
            });

            // Make a center of current position in map
            $('#map_canvas').gmap('get', 'map').panTo(clientPosition);

            // Send current position to operator
            // TODO:
            // Geolocation APIの現在地取得タイミングによっては，
            // 最初のPositionが送信されない
            // 例えば，connを開くまえに取得した場合
            if(conn !== null)
                conn.send(JSON.stringify({
                    "lat": position.coords.latitude,
                    "lng": position.coords.longitude
                }));
        }
    });
});

// Some operators in connection is displayed
function disp_opes(opes){
    // If nobody is in connection
    if($.isEmptyObject(opes)){
        // Append figure tag template
        $("#opelist").append("<figure><figcaption></figcaption></figure>");
        $("figure figcaption", "#opelist").
            text("Sorry... Nobody of operator is in connection.");
        // Add svg tag of ope_svg to after figure tag
        $("figure", "#opelist").prepend(ope_svg);
        // Change ope_svg color to negative color
        $("#body path").attr("fill", "#F80E0E");
        return;
    }

    $.each(opes, function(idx, id){
        // Get the country code of the operator
        var cc = id.split('-')[1];
        // Get the operator name
        var name = id.split('-')[2];
        // Create the tag for the operator of id
        $("#opelist").append("<figure id="+name+"></figure>");
        $("#"+name).
            // Setting operator icon written in svg
            append(ope_svg).
            append("<figcaption>"+name+"</figcaption>");

        // Overrige the tie with a country tie
        $.get('./img/cc_tie/' + cc + '.svg', function(svg){
            $("#tie", "#"+name).html($(svg).find("#"+cc).html());
        }, 'text');

        $("#"+name).find("#Body").click(function(){
            // All ID(#body) color is set to #26453D
            $("figure > svg", "#opelist").find("#body path").attr("fill", "#26453D");
            // THIS icon color is set to positive color
            $(this).find("#body path").attr("fill", "#11D528");

            // Update operator ID
            ope_id = id;
        });
    });
}

// Initializing the peer,
// and then setting some callbacks
function initpeer(){
    peer = new Peer({key: APIKEY, debug:3});
    peer.on('open', function(id) {
        peer.listAllPeers(function(list){
            // Get only operator peer list
            var ope_list = list.filter(function(v){return v.match(/^ope-[a-z][a-z]-/);});
                //function(v){return v.substring(0,3) == "ope-";});
            disp_opes(ope_list);
        });
    }).on('close', function(){
    }).on('error', function(err){
        alert(err.message);
    });
}

// Connecting with a remote user,
// and then setting some callbacks
function makeconn(){
    // Start DataConnections
    conn = peer.connect(ope_id);
    conn.on('open', function(){
    }).on('data', function(data){
        // Receive a data
        $("#nicenav").show();
        // Setting the path of CGI program with some parameters
        $("#nicepage").attr("href", data);
    }).on('error', function(err){
        alert(err.message);
    });
}

// Making a call to a remote user,
// and then setting some callbacks
function makecall(){
    // Start MediaConnection
    call = peer.call(ope_id, window.localStream);
    call.on('stream', function(stream){
        // Receive a stream
        $("#partner-video").prop('src', URL.createObjectURL(stream));
    });

    if(window.existingCall)
        window.existingCall.close();
    window.existingCall = call;
}
