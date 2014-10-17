
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
    // Initialize page for english
    $("#location").removeClass().addClass('flag flag-us');
    $("#localecode").text('(en)');
    $.post("./php/navpage.php", function(data){
        // Get and Set Original Text
        $("#body_txt").html(data);
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
    $("#loading").addClass("loading");

    // Execute Translation
    $.post("./php/translate.php",
           { 'lc': lc }, // POST Parameter
           function(data){ // success callback func
               // Update the flag and the location in header of #nav page
               $("#localecode").text('(' + lc + ')');
               $("#location").removeClass().addClass('flag flag-' + cc);

               // JSON key: header, body
               // Update Header Title
               $("#header_title strong").text(data.header);
               // Clear inside #body_txt
               $("#body_txt").html('');
               // Add #body_txt elements
               $.each(data.body, function(idx){
                   $("#body_txt").append("<p>"+data.body[idx]+"</p>");
               });

               $("#loading").removeClass("loading");
           }, "json");
}
