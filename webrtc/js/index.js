$(function(){
    // Create rupported country listview
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

    // Get and Set Original Text
    $.post("./php/navpage.php", function(data){$("#body_txt").html(data);});
});

// Move #nav page
function move_navpage(){
    // Get selected country code
    var cc = $(this).attr('id');
    // Get language code of selected country
    var lc = $('input[name="langcode"]', this).val();

    update_navpage(cc, lc);

    // Callボタンのリンクに国コードパラメータを追加
    //$("#call").attr('href', 'client.html?cc=' + code);
    $.mobile.changePage("#nav");
}

// Update #nav page elements
// cc: country code, lc: language code
function update_navpage(cc, lc){
    // Update the flag and the location in header of #nav page
    $("#flglc").text('(' + lc + ')');
    $("#flg").removeClass().addClass('flag flag-' + cc);
    // Update hidden input parameter
    $('input[name="cntrycode"]', "#nav-main").val(cc);

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
           },
           "json");
}
