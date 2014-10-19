
function detectBrowser(){
    var useragent = navigator.userAgent;

    // Change #map_canvas size
    var mapdiv = document.getElementById('map_canvas');
    mapdiv.style.width = '100%';
    if(useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1)
        // if smartphone
        // 70% of device height
        mapdiv.style.height = Math.floor($(window).height()*.7).toString() + 'px';
    else
        // if pc
        mapdiv.style.height = '400px';
}

var map;
var dir_service, dir_renderer;
var dir_markers = [];
var here, poly, step_info;
// Created Map Flag
var flg = false;

//$(document).on('pageinit', '#gmaps', function(e, data){
$(document).on('pageinit', function(e, data){
    $('input[name=tmode]:radio').change(function(){ updatedir(); });
    $('#update').click(function(){ updatedir(); });

    detectBrowser();
});

//$(document).on('pageshow', '#gmaps', function(e, data){
$(document).on('pageshow', function(e, data){
    if(flg)
        // Already create map object
        return;

    if(navigator.geolocation){
        var options = {
            maximumAge: 500000,
            enableHighAccuracy: true,
            timeout: 6000
        };
        navigator.geolocation.getCurrentPosition(success, fail, options);

        function success(pos){
            // Get current position
            var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);

            if($("#input_from").val() === '')
                // If #input_from value is empty,
                // setting geocode of current position into #input_from value 
                new google.maps.Geocoder().geocode(
                    {location: latlng, region: 'ja'},
                    function(results, status){
                        if(status === google.maps.GeocoderStatus.OK)
                            $("#input_from").val(results[0].formatted_address);
                    }
                );

            // Set Callback of watchPosition
            watch_id = navigator.geolocation.watchPosition(function(pos){
                var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                updatemap(latlng);
            }, fail);

            initmap()
            // Create a marker
            here = new google.maps.Marker({
                position: latlng,
                icon: './img/here.png',
                map: map
            });
            map.panTo(latlng);
        }
        function fail(error){
            alert('Can not get your current position.');
        }
        flg = true;
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
        zoom: 15,
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

    // Create Object of Direction Service and Renderer
    dir_service = new google.maps.DirectionsService();
    dir_renderer = new google.maps.DirectionsRenderer({
        map: map,
        preserveViewport: true // no bounds
    });

    // Create Information Window Object
    step_info = new google.maps.InfoWindow();
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
}

// Update the direction
function updatedir(){
    // Clear all markers in direction
    for(var i=0; i<dir_markers.length; i++){
        dir_markers[i].setMap(null);
    }
    dir_markers = [];

    var request = {
        origin     : $('#input_from').val(),
        destination: $('#input_to').val(),
        travelMode : google.maps.DirectionsTravelMode[$('input[name=tmode]:checked').val()]
    };

    // Setting a direction into the map and some markers on the map
    dir_service.route(request, function(response, status){
        if(status === google.maps.DirectionsStatus.OK){
            dir_renderer.setDirections(response);
            marksdir(response);
        }
    });
}

// Mark some marker on the map for each step
function marksdir(result){
    var route = result.routes[0].legs[0];

    for(var i=0; i<route.steps.length; i++){
        var marker = new google.maps.Marker({
            position: route.steps[i].start_location,
            map: map
        });

        // Set callback of click for each marker
        (function(m, t){
            google.maps.event.addListener(marker, 'click', function(){
                // Display the instruction of the marker
                step_info.setContent(t);
                step_info.open(map, m);
            });
        })(marker, route.steps[i].instructions);

        dir_markers[i] = marker;
    }
}
