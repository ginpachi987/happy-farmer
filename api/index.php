<?php
include_once("./keys.php");

$db_connect = mysqli_connect($SERVER_ADDRESS, $DBUSERNAME, $PASSWORD, $DB);

$data = json_decode(file_get_contents('php://input'));

$responce = [];

header_remove();
// header('Access-Control-Allow-Origin: *');
http_response_code(200);

header('Content-type: application/json');
header('Status: 200 OK');

// $responce['user'] = [];

// $responce['user']['name'] = 'Pupsik';
// $responce['user']['balance'] = 100;
// $responce->avatar = 

$uid = 1;

switch ($data->event) {
  case 'buy':
    buyCell($data->id, $uid, $db_connect);
    break;
  
  default:
    // init($user_id, $db_connect);
    break;
}

  $request = "SELECT * FROM `users` WHERE `id` = '$uid'";
  $result = mysqli_query($db_connect, $request);
  $responce['user'] = mysqli_fetch_assoc($result);

  $request = "SELECT * FROM `fields` WHERE `pid` = '$uid'";
  $result = mysqli_query($db_connect, $request);
  $responce["field"] = [];
  while ($row = mysqli_fetch_assoc($result)) {
    array_push($responce["field"], $row);
  }

  echo json_encode($responce);

function buyCell($cell, $uid, $db_connect) {
  $request = "SELECT balance FROM `users` WHERE `id` = '$uid'";
  $result = mysqli_query($db_connect, $request);
  $balance = mysqli_fetch_assoc($result)['balance'];

  if ($balance >= ($cell * 1.2) * 10) {
    $balance -= ($cell * 1.2) * 10;

    $request = "UPDATE `users` SET `balance` = '$balance' WHERE `id` = '$uid'";
    mysqli_query($db_connect, $request);

    $request = "UPDATE `fields` SET `buystate` = 2 WHERE `pid` = '$uid' AND `id` = '$cell'";
      mysqli_query($db_connect, $request);

    if ($cell < 32) {
      $request = "UPDATE `fields` SET `buystate` = 1 WHERE `pid` = '$uid' AND `id` = '$cell' + 1";
      mysqli_query($db_connect, $request);
    }
  }



 

  
}

?>