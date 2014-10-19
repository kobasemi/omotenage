
// whether or not passed #home
var passhome_flg = false;

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

    // Initialize page for english
    translate('us', 'en');
    passhome_flg = true;
    $(window).resize();
});

$(window).resize(function(){
    var popw = $(window).width() * .7;
    var poph = $(window).height() * .7;
    $("#popinfo").width(popw).height(poph);
});

$(document).on('pagebeforecreate', '#nav', function(e, data){
    // -> User reload in this page
    if(!passhome_flg){
        // If not passed #home, move #home
        $.mobile.changePage("#home");
    }
});

// Original Text Language
var pre_lc = "en";
// Move #nav page
function move_navpage(){

    // Get selected country code
    var cc = $(this).attr('id');
    // Get language code of selected country
    var lc = $('input[name="langcode"]', this).val();

    if(lc !== pre_lc){
        // If the translation TARGET doesn't equal to the previous TARGET,
        // translate to the TARGET
        translate(cc, lc);
        // Previous country language is updated
        pre_lc = lc;
    }

    $.mobile.changePage("#nav");
}

// Buffered translated data
var translated = [];
function translate(cc, lc){

    // If the target data already exist, update #nav page using it
    var updated = false;
    $.each(translated, function(i, value){
        if(value.cc === cc){
            update_navpage(value);
            return updated = true;
        }
    });
    if(updated) return;

    // If no budder
    // Display loading image
    $("#loading").addClass("loading");
    // Execute Translation
    $.post("./php/translate.php",
           { 'lc': lc }, // POST Parameter
           function(data){
               // Buffering
               var buf = {"cc": cc, "lc": lc, "header": data.header, "body": data.body};
               translated.push(buf);

               update_navpage(buf);

               // Hide loading image
               $("#loading").removeClass("loading");
           }, "json");
}


// Update #nav page elements
// data{cc: country code, lc: language code,
// header: page header text, body: page body text}
function update_navpage(data){
    // Update the flag and the location in header of #nav page
    $("#localecode").text('(' + data.lc + ')');
    $("#location").removeClass().addClass('flag flag-' + data.cc);

    // JSON key: header, body
    // Update Header Title
    $("#header_title strong").text(data.header);
    // Clear inside #body_txt
    $("#body_txt").html('');
    // Add #body_txt elements
    $.each(data.body, function(idx, value){
        $("#body_txt").append("<p>"+value+"</p>");
    });
}
