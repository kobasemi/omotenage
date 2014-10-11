<?php
require "orgtxt.php";

$body = '';
foreach($orgtxt as $line){
    $body .= '<p>'.$line.'</p>';
}
print $body;
