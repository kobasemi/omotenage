// URL Parameter Getter
$.extend({
    getUrlVars: function(){
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    },
    getUrlVar: function(name){
        return $.getUrlVars()[name];
    }
});
// country code
var cc = $.getUrlVar('cc');

// Get a stream for video and audio connection
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

// Skyway API Key for The Domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// Operator Peer ID
var ope_id =  ope_ico = "";
// conn: DataConnection, call: MediaConnection
var peer = conn = call = null;

$(document).on('pageinit', '#pick-wind', function(e, data){
    $.get('./img/operator.svg', function(svg){
        ope_ico = svg;
    }, 'text');

    initpeer();

    $('#call').click(function(){
        if(ope_id === ""){
            popup_err('NOPICK');
            return;
        }
        makecall();
        $.mobile.changePage("#call-wind");
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

// Popup a error page
function popup_err(EDESC){
    // EDESC: ERROR DESCRIPTION
    switch(EDESC){
        case 'NOOPE': // Some operators doesn't exist
            break;
        case 'NOPICK': // Nobody is a selected operator
            break;
        case 'OFFMEDIA': // The media(camera, mic) are off
            break;
        default: // Other case
            break;
    }

    $("#popup").popup();
    $("#popup")/*.html(popbody)*/.popup('open');
}

// Some operators in connection is displayed
function disp_opes(opes){
    // If nobody is in connection
    if($.isEmptyObject(opes)){
        popup_err('NOOPE');
        // Append figure tag template
        $("#opelist").append("<figure><figcaption></figcaption></figure>");
        $("figure figcaption", "#opelist").
            text("Sorry... Nobody of operator is in connection.");
        // Add svg tag of ope_ico to after figure tag
        $("figure", "#opelist").prepend(ope_ico);
        // Change ope_ico color to negative color
        $("#nottie").attr("fill", "#F80E0E");
        return;
    }

    $.each(opes, function(idx, id){
        // Get the operator name
        var name = id.split('-')[1];
        // Create the tag for the operator of id
        $("#opelist").append("<figure id="+name+"></figure>");
        $("#"+name).
            // Setting operator icon written in svg
            append(ope_ico).
            append("<figcaption>"+name+"</figcaption>");

        // Setting the color of tie to a random color
        var tie_color = Math.floor(Math.random()*16777215).toString(16);
        $("#tie", "#"+name).attr("fill", "#"+tie_color);

        $("#"+name).find("#ope_ico").click(function(){
            // All ID(#nottie) color is set to #26453D
            $("figure > svg", "#opelist").find("#nottie").attr("fill", "#26453D");

            // THIS icon color is set to positive color
            $(this).find("#tie").attr("fill", "white");
            $(this).find("#nottie").attr("fill", "#11D528");

            // Update operator ID
            ope_id = id;

            navigator.getUserMedia({audio: true, video: true}, function(stream){
                window.localStream = stream;
            }, function(){
                popup_err('OFFMEDIA');
            });
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
            var ope_list = list.filter(function(v){return v.substring(0,2) == cc;});
            disp_opes(ope_list);
        });

        peer.on('close', function(){
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

// Connecting with a remote user,
// and then setting some callbacks
function makeconn(){
    // Start DataConnections
    conn = peer.connect(ope_id);
    conn.on('open', function(){
        conn.on('data', function(data){
            // Receive a data
            $("#nicenav").show();
            // Setting the path of CGI program with some parameters
            $("#nicepage").attr("href", data);
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

// Making a call to a remote user,
// and then setting some callbacks
function makecall(){
    // Start MediaConnection
    call = peer.call(ope_id, window.localStream);
    call.on('open', function(){
        call.on('stream', function(stream){
            // Receive a stream
            $("#partner-video").prop('src', URL.createObjectURL(stream));
        });
    });

    if(window.existingCall)
        window.existingCall.close();
    window.existingCall = call;
}
