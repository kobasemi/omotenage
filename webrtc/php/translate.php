<?php

// Read Microsoft Translator API Key
require "apikey.php"; // APPID

// Translate $text from $from to $to
// Return: Translated Text
function translate($text, $from, $to){
    $ch = curl_init('https://api.datamarket.azure.com/Bing/MicrosoftTranslator/v1/Translate?Text=%27'.urlencode($text).'%27&From=%27'.$from.'%27&To=%27'.$to.'%27');
    curl_setopt($ch, CURLOPT_USERPWD, APPID.':'.APPID);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // $r: Result of Translation
    $r = curl_exec($ch);
    $r = explode('<d:Text m:type="Edm.String">', $r);
    $r = explode('</d:Text>', $r[1]);
    // Extract Translated Text
    return urldecode($r[0]);
}
