<?php

	$executionStartTime = microtime(true);
//this includes the login details
	include("config.php");

	header('Content-Type: application/json; charset=UTF-8');

	$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

	if (mysqli_connect_errno()) {
		
		$output['status']['code'] = "300";
		$output['status']['name'] = "failure";
		$output['status']['description'] = "database unavailable";
		$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output);

		exit;

	}	
	$firstName = trim($_REQUEST['param1']);
	$lastName = trim($_REQUEST['param2']);
	$email = trim($_REQUEST['param3']);
	// SQL statement accepts parameters and so is prepared to avoid SQL injection.
	// $_REQUEST used for development / debugging. Remember to change to $_POST for production
	$query = $conn->prepare('UPDATE personnel SET firstName=?, lastName=?, email=?, departmentID=? WHERE id=?');
	$query->bind_param('sssii', $firstName, $lastName, $email, $_REQUEST['param4'], $_REQUEST['param5']);
	$query->execute();
	
	if (false === $query) {

		$output['status']['code'] = "400";
		$output['status']['name'] = "executed";
		$output['status']['description'] = "query failed";	
		$output['data'] = [];

		mysqli_close($conn);

		echo json_encode($output); 

		exit;

	}

	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "success";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
	$output['data'] = [$_REQUEST['param1']];
	
	mysqli_close($conn);

	echo json_encode($output); 

?>