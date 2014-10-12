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

/* WEBRTC */
// Get a stream for video and audio connection
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// Skyway API key for the domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// Operator ID
var opeId = "";

var peer = null;
var conn = null;
var call = null;

$(document).on('pageinit', '#pick-wind', function(e, data){
    $("#partner-video").css("height", $(window).height()/2-50);
    $("#map_canvas").css("height", $(window).height()/2);
    $("#my_page").hide();

    $.get('./img/person.svg', function(svg){
        $("figure", "#ope-ico").prepend(svg);
        $("figure > svg > g").click(function(){
            $(this).find("#tie").attr("fill", "#FF0000");
        });
    }, 'text');

    // PeerJS
    peer = new Peer({key: APIKEY, debug:3});
    peer.on('open', function(id) {
        peer.listAllPeers(function(list){
            //TODO: 複数人未対応
            opeId = list.filter(function(v){return v.substring(0,2) == cc;})[0];
        });
    });

    navigator.getUserMedia({audio: true, video: true}, function(stream){
        window.localStream = stream;
    }, function(){
        alert("You should enable the permit of Camera and Mic.");
    });

    $('#call').click(function(){
        ready();
    });

    $('#endcall').click(function(){
        call.close();
        conn.close();
        peer.disconnect();
        peer.destroy();
    });
});

$(document).on('pageinit', '#call-wind', function(e, data){
    callTo(call);
});

$(document).on('pageshow', '#call-wind', function(e, data){
    /* Google Maps API */
    var path= []; // For move route of remote user
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
                'path': path,
            });

            // Make a center of current position in map
            $('#map_canvas').gmap('get', 'map').panTo(clientPosition);

            // Send current position to operator
            if(conn !== null)
                conn.send(JSON.stringify({
                    "lat": position.coords.latitude,
                    "lng": position.coords.longitude
                }));
        }
    });
});

function ready(){
    // Receiving a call
    peer.on('call', function(call){
        // It's impossible that something could recieve in this system.
    });

    peer.on('error', function(err){
        alert(err.message);
    });

    peer.on('connection', function(conn){
        conn.on('data', function(data){
            // TODO: オペレータから固有のページURLを受信
            console.log(data);
            $("#my_page").attr("href", data);
            $("#my_page").show();
        });
    });

    // Video/audio calls
    call = peer.call(opeId, window.localStream);
    // Data connections
    conn = peer.connect(opeId);
}

function callTo(call){
    if(window.existingCall)
        window.existingCall.close();

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream){
        $("#partner-video").prop('src', URL.createObjectURL(stream));
    });

    // UI stuff
    window.existingCall = call;
}
