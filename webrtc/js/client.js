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
var ope_id = "";
// conn: DataConnection, call: MediaConnection
var peer = conn = call = null;

$(document).on('pageinit', '#pick-wind', function(e, data){
    $.get('./img/person.svg', function(svg){
        $("figure", "#ope-ico").prepend(svg);
        $("figure > svg > g").click(function(){
            $(this).find("#tie").attr("fill", "#FF0000");
        });
    }, 'text');

    navigator.getUserMedia({audio: true, video: true}, function(stream){
        window.localStream = stream;
    }, function(){
        alert("You should enable the permit of Camera and Mic.\n" +
              "Please reload this page.\n");
    });

    initpeer();

    $('#call').click(makecall);
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
            if(conn !== null)
                conn.send(JSON.stringify({
                    "lat": position.coords.latitude,
                    "lng": position.coords.longitude
                }));
        }
    });
});

// Initializing the peer,
// and then setting some callbacks
function initpeer(){
    peer = new Peer({key: APIKEY, debug:3});

    peer.on('open', function(id) {
        peer.listAllPeers(function(list){
            //TODO: 複数人未対応
            ope_id = list.filter(function(v){return v.substring(0,2) == cc;})[0];
        });

        peer.on('call', function(call){
            // Receiving a call
            // It's impossible that something could recieve in this system
        }).on('connection', function(conn){
        }).on('close', function(){
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

// Connecting with a remote user,
// and then setting some callbacks
function makeconn(){
    // Data connections
    conn = peer.connect(ope_id);

    conn.on('open', function(){
        conn.on('data', function(data){
            // TODO: オペレータから固有のページURLを受信
            $("#nicenav").show();
            $("#nicenav > a").attr("href", data);
        }).on('error', function(err){
            alert(err.message);
        });
    });
}

// Making a call to a remote user,
// and then setting some callbacks
function makecall(){
    // Video/audio calls
    call = peer.call(ope_id, window.localStream);

    if(window.existingCall)
        window.existingCall.close();

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream){
        $("#partner-video").prop('src', URL.createObjectURL(stream));
    });

    window.existingCall = call;
}
