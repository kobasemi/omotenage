$(document).on('pageinit', '#home', function(e, data){
    // Create supported country listview
    $.getJSON("SupportCountry.json", function(data){
        // Read supported country in JSON file
        $.each(data.support, function(idx, json){
            // Create the country list
            var country = $('<li id="'+json.cc+'"><input type="hidden" name="langcode" value="'+json.lc+'" /><a href="#"><img src="img/blank.gif" class="flag flag-'+json.cc+' ui-li-icon" alt="'+json.name+'" />'+json.name+'</a></li>');

            country.click(move_navpage);
            $("#pick").append(country);
            $("#pick").listview().listview("refresh");
        });
    });
});

$(document).on('pageinit', '#nav', function(e, data){
    // Get and Set Original Text
    $.post("./php/navpage.php", function(data){
        $("#body_txt").html(data);
    });
});

$(document).on('pageshow', '#nav', function(e, data){
    $("#call").click(function(){
        // Extract a country code from the class values of #flag
        var cc = $("#flag").
            attr("class").
            split(" ").
            filter(function(v){return v.substring(0,5) == 'flag-';})[0].
            split("-")[1];

        // Set the link with GET parameter(cc: country code)
        $("#call").attr('href', './client.html?cc=' + cc);
    });
});

// Move #nav page
function move_navpage(){
    // Get selected country code
    var cc = $(this).attr('id');
    // Get language code of selected country
    var lc = $('input[name="langcode"]', this).val();

    update_navpage(cc, lc);
    $.mobile.changePage("#nav");
}

// Update #nav page elements
// cc: country code, lc: language code
function update_navpage(cc, lc){
    // Update the flag and the location in header of #nav page
    $("#flaglc").text('(' + lc + ')');
    $("#flag").removeClass().addClass('flag flag-' + cc);

    // Execute Translation
    $.post("./php/translate.php",
           { 'lc': lc }, // POST Parameter
           function(data){ // success callback func
               // JSON key: header, body
               // Update Header Title
               $("#header_title strong").text(data.header);
               // Clear inside #body_txt
               $("#body_txt").html('');
               // Add #body_txt elements
               $.each(data.body, function(idx){
                   $("#body_txt").append("<p>"+data.body[idx]+"</p>");
               });
           }, "json");
}
