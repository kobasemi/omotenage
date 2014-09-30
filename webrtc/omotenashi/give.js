$(function(){
    $('#main > div').css({"margin": "0.5em", "padding":"0.5em"});
    $('#main > div').addClass("ui-bar-c ui-corner-all ui-shadow");
    $('input[name=tmode]:radio').change(function(){ updateDirectionsOnMap(); });
    $('input:text').change(function(){ updateDirectionsOnMap(); });
});

/* Google Maps API */
$('#map_canvas').gmap().bind('init', function(evt, map) {
    $('#map_canvas').gmap('getCurrentPosition', function(position, status) {
        if ( status === 'OK' ) {
            var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setOptions({'center': clientPosition, 'zoom':20});
            $('#map_canvas').gmap('addMarker', {'position': clientPosition, 'bounds': false});
            $('#map_canvas').gmap('search', {'location': clientPosition}, function(results, status){
                if(status === 'OK'){
                    $("#input_from").val(results[0].formatted_address);
                }});
        }
    });

    var path= [];
    $('#map_canvas').gmap('watchPosition', function(position, status){
        if(status === 'OK'){
            var clientPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $('#map_canvas').gmap('clear', 'markers');
            $('#map_canvas').gmap('addMarker', {'position': clientPosition});
            path.push(clientPosition);
            $('#map_canvas').gmap('addShape', 'Polyline', {
                'strokeWeight': 10,
                'strokeColor': '#FF0000',
                'strokeOpacity': 0.8,
                'path': path,
            });
            $('#map_canvas').gmap('get', 'map').panTo(clientPosition);
        }
    });
});

function updateDirectionsOnMap(){
    $('#map_canvas').gmap('displayDirections', {
        'origin': $('#input_from').val(),
        'destination': $('#input_to').val(),
        'travelMode': google.maps.DirectionsTravelMode[$('input[name=tmode]:checked').val()],
    }, {
        'panel': document.getElementById('')
    }, function(result, status){
        if(status === 'OK'){}
    });
}
