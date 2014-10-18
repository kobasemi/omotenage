
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
// Flag to check passed #pick-wind
var pass_flg = false;
// here: Marker, poly: Polyline
var map, here, poly;

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
            makeconn();
            $.mobile.changePage("#call-wind");
        }, function(){
            alert('The media(camera, mic) are off');
        });

        pass_flg = true;
    });

    $('#endcall').click(function(){
        window.localStream.stop();
        $("#partner-video").prop('src', '');
        call.close();
        conn.close();
        call = conn = null;
        ope_id = "";
    });

    $('#operefresh').click(function(){
        // Refresh the operator list
        ope_id = "";
        if(peer !== null)
            peer.listAllPeers(function(list){
                // Get only operator peer list
                var ope_list = list.filter(function(v){return v.match(/^ope-[a-z][a-z]-/);});
                disp_opes(ope_list);
            });
    });
});

$(document).on('pageinit', '#call-wind', function(e, data){
    if(pass_flg === false)
        $.mobile.changePage("#pick-wind");

    $("#partner-video").css("height", $(window).height()/2-50);
    $("#map_canvas").css("height", $(window).height()/2);
    $("#nicenav").hide();
});

$(document).on('pageshow', '#call-wind', function(e, data){
    if(navigator.geolocation){
        var options = {
            maximumAge: 500000,
            enableHighAccuracy: true,
            timeout: 6000
        };
        navigator.geolocation.getCurrentPosition(success, fail, options);

        function success(pos){
            initmap();

            // Get current position
            var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

            // Create a marker
            here = new google.maps.Marker({
                position: latlng,
                icon: './img/here.png',
                map: map
            });
            map.panTo(latlng);

            // TODO:
            // Geolocation APIの現在地取得タイミングによっては，
            // 最初の位置が送信されない
            // 例えば，connを開くまえに取得した場合
            if(conn.open){
                // If conn is open, send current position
                conn.send(JSON.stringify({
                    "lat": latlng.lat(),
                    "lng": latlng.lng()
                }));
            }

            // Set Callback of watchPosition
            watch_id = navigator.geolocation.watchPosition(function(pos){
                var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                updatemap(latlng);
            }, fail);
        }
        function fail(error){
            alert('Can not get your current position.');
        }
    }else{
        // No geolocation support
        alert('Your browser is no geolocation support.');
    }
});

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

// Update a map
function updatemap(latlng){
    // Add a line
    var path = poly.getPath();
    path.push(latlng);

    // Clear previous marker, and then
    // Set new marker
    here.setMap(null);
    here = new google.maps.Marker({
        position: latlng,
        icon: './img/here.png',
        map: map
    });

    map.panTo(latlng);

    if(conn.open){
        conn.send(JSON.stringify({
            "lat": latlng.lat(),
            "lng": latlng.lng()
        }));
    }
}

// Some operators in connection is displayed
function disp_opes(opes){
    // If nobody is in connection
    if($.isEmptyObject(opes)){
        // Append figure tag template
        $("#opelist").html("<figure><figcaption></figcaption></figure>");
        $("figure figcaption", "#opelist").
            text("Sorry... Nobody of operator is in connection.");
        // Add svg tag of ope_svg to after figure tag
        $("figure", "#opelist").prepend(ope_svg);
        // Change ope_svg color to negative color
        $("#body path").attr("fill", "#F80E0E");
        return;
    }

    $("#opelist").html("");
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
