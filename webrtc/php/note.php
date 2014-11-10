<?php

// Read translate function
require "translate.php";
// Read Original Contents
require "orgtxt.php";

// Original Text Language: English
$from = 'en';
// Translation Target
// lc: language code
if(isset($_POST['lc']))
    $to = $_POST['lc'];
else
    $to = 'en';

if($from === $to){
    // No Translation
    echo json_encode($contents);
    exit();
}

// BEGIN Translation
$contents['header'] = translate($contents['header'], $from, $to);
foreach($contents['body'] as $key => $value){
    // Update from original text to translation text.
    $contents['body'][$key] = translate($value, $from, $to);
}

// Return JSON Data
echo json_encode($contents);
