<?php

// Original Body Text
$orgtxt = array(
    // line 1
    'l1' => 'In order to do the best "OMOTENASHI", expert guide will show you around the street of Tokyo.',
    // line 2
    'l2' => 'Pushing the button below, you just call a guide.',
    // line 3
    'l3' => 'NOTE: Next Page needs to allow you to get Camera and Mic, GPS.'
);
// Main Contents
$contents = array(
    "header" => 'Welcome to Japan',
    "body" => $orgtxt
);

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

// Read translate function
require "translate.php";
// BEGIN Translation
$contents['header'] = translate($contents['header'], $from, $to);
foreach($contents['body'] as $key => $value){
    // Update from original text to translation text.
    $contents['body'][$key] = translate($value, $from, $to);
}

// Return JSON Data
echo json_encode($contents);
