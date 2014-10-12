$(function(){
    $("#map_canvas").css("height", $(window).height());
    $("#accept").click(function(){
        ready();
    });
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
// ビデオ通信のためのストリームを取得
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// Skyway API key for the domain: www.firefly.kutc.kansai-u.ac.jp
var APIKEY = "79e1e834-4935-11e4-878c-e1a8ecd1a309";
var peer = null;

function ready(){
    // Country Code
    var cc = $('#select_cc').val();
    // Operater Name
    var name = $('#input_name').val();
    // My ID
    var myId = cc + "-ope-" + name;
    var remoteId = "";
    if(isValidId(myId)){
        // if id is valid

        // Change to disable this elements
        $("#accept").text("受付中");
        $("#accept").addClass("ui-state-disabled");
        $("#select_cc").selectmenu("disable");
        $("#input_name").textinput("disable");

        // Open Media(Camera and Mic)
        navigator.getUserMedia({audio: true, video: true}, function(stream){
            window.localStream = stream;
        }, function(){
            alert("You should enable the permit of Camera and Mic.");
        });

        // Open Peer
        peer = new Peer(myId, {key: APIKEY, debug:3}); 
        peer.on('open', function(){
            console.log('Peer ID is: ' + myId);
        });
        peer.on('call', function(call){
            remoteId = call.peer;
            call.answer(window.localStream);
            call.on('stream', function(stream){
                $("#pertner-video").prop("src", URL.createObjectURL(stream));
            });
        });
        peer.on('connection', function(conn){
            conn.on('data', function(data){
                // 送られてきた経緯度情報取得
                var pos = $.parseJSON(data);
                updateMap(new google.maps.LatLng(pos.lat, pos.lng));
            });
        });
        peer.on('close', function(){
            $("#pertner-video").prop("src", "");
            alert("Closed...");
        });
    }else{
        // if id is invalid... 
        alert("名前を入力してください(半角英数字)．");
    }
    $("#gene").click(function(){
        // TODO: ページ生成CGIの作成
    });
    $("#send").click(function(){
        var pageUrl = '/omotenashi/give.html';
        // 生成したページを送信
        var conn = peer.connect(remoteId);
        conn.send(pageUrl);
    });
}

// 有効なIDかをチェックする
function isValidId(ope_id){
    if($.inArray('', ope_id.split('-')) !== -1)
        // Array elements contain ''
        return false;
        else
            return true;
}

/* Google Maps API */
// 東京駅を中心にマップを生成
$('#map_canvas').gmap().bind('init', function(evt, map) {
    map.setOptions({
        'center': new google.maps.LatLng(35.681382,139.766084),
        'zoom':15});
});

// 通信相手の通過経路
var path= [];

// 通信相手の位置情報を更新する
// latlng: 通信相手の現在地の経緯度
function updateMap(latlng){

    // 前回位置のマーカを削除し、
    // 現在位置のマーカを追加する
    $('#map_canvas').gmap('clear', 'markers');
    $('#map_canvas').gmap('addMarker', {'position': latlng});

    // 通過した経路を作成する
    path.push(latlng);
    $('#map_canvas').gmap('addShape', 'Polyline', {
        'strokeWeight': 10,
        'strokeColor': '#FF0000',
        'strokeOpacity': 0.8,
        'path': path,
    });
    // マップの中心を現在地に移動する
    $('#map_canvas').gmap('get', 'map').panTo(latlng);
}
