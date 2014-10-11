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

$(function(){
    $("#webrtc").css("height", $(window).height()/2-50);
    $("#map_canvas").css("height", $(window).height()/2);
    $("#my_page").hide();
});

/* WEBRTC */
// Skyway API key for the domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
// Operator ID
var opeId = "";
// ビデオ通信のためのストリームを取得
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
navigator.getUserMedia(
    {audio: true, video: true},
    function(stream){
        window.localStream = stream;
    },
    function(){
        alert("You should enable the permit of Camera and Mic.");
    }
);

// PeerJS
var peer = new Peer({key: APIKEY, debug:3});
peer.on('open', function(id) {
    peer.listAllPeers(function(list){
        //TODO: 複数人未対応
        opeId = list.filter(function(v){return v.substring(0,2) == cc})[0];
    });
});

// Receiving a call
peer.on('call', function(call){
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
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
var conn = null;
var call = null;
$(function(){
    $('#call').click(function(){
        if($("#call > a").text() === "CALL"){
            // CALLをクリックした場合
            // ボタンを変更
            $("#call > a").attr("style","background: #f80e0e; color: white;").text("DISCONNECT");
            // Video/audio calls
            call = peer.call(opeId, window.localStream);
            // Data connections
            conn = peer.connect(opeId);

            callTo(call);
        }else{
            // DISCONNECTをクリックした場合
            call.close();
            conn.close();
            peer.disconnect();
            peer.destroy();
        }
    });
});

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

/* Google Maps API */
$('#map_canvas').gmap().bind('init', function(evt, map) {
    $('#map_canvas').gmap('getCurrentPosition', function(position, status) {
        if ( status === 'OK' ) {
            var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': true});
        }
    });
});
var path= [];
$('#map_canvas').gmap('watchPosition', function(position, status){
    if(status === 'OK'){
        var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // 前回位置のマーカを削除し、
        // 現在位置のマーカを追加する
        $('#map_canvas').gmap('clear', 'markers');
        $('#map_canvas').gmap('addMarker', {'position': clientPosition});

        path.push(clientPosition);
        $('#map_canvas').gmap('addShape', 'Polyline', {
            'strokeWeight': 10,
            'strokeColor': '#FF0000',
            'strokeOpacity': 0.8,
            'path': path,
        });
        // マップの中心を現在地に移動する
        $('#map_canvas').gmap('get', 'map').panTo(clientPosition);

        // 現在地を送信
        if(conn !== null)
            conn.send(JSON.stringify({
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            }));
    }
});
