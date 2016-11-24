<?php

/* Fix up the Base64 data */
$encodedData = str_replace(' ','+',$_POST['data']);

/* Extract the MIME type */
preg_match('/data:(.*?);base64,(.*)/', $encodedData, $matches);
array_shift($matches);
list($mime_type, $data) = $matches;
$exts = [
  'image/gif'         => '.gif',
  'image/jpeg'        => '.jpg',
  'image/png'         => '.png',
];

/* Prepare the response */
header('Content-Type: application/json');
if(!isset($exts[$mime_type]))
{
  die(json_encode([
    'status'=>'error',
    'message'=>'Invalid image type.',
  ]));
}

/* Decode the base64 data */
$decodedData = base64_decode($data);

/* Save the file */
$fname = md5($decodedData).$exts[$mime_type];
file_put_contents(__DIR__.'/'.$fname, $decodedData);

/* Return the final response */
$args = [
  'status'=>'success',
  'url'=>sprintf('/server/%s', $fname),
];
die(json_encode($args));