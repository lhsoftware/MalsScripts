<?php


// OPTIONS - PLEASE CONFIGURE THESE BEFORE USE!

$yourEmail = "leehardingsoftware@gmail.com"; // the email address you wish to receive these mails through
$yourWebsite = "lh-software.000webhostapp.com"; // the name of your website
$maxPoints = 4; // max points a person can hit before it refuses to submit - recommend 4

$subject = "Test subject";
$message = "this is the message";
echo "try email...";
$sent = mail($yourEmail,$subject,$message);
if($sent){
    exit "worked";
}else{
    exit "nope";
}


function isBot() {
	$bots = array("Indy", "Blaiz", "Java", "libwww-perl", "Python", "OutfoxBot", "User-Agent", "PycURL", "AlphaServer", "T8Abot", "Syntryx", "WinHttp", "WebBandit", "nicebot", "autoemailspider","Atomic_Email_Hunter/4.0","ContactBot/0.2","ContentSmartz");
	$isBot = false;
	
	foreach ($bots as $bot)
	if (strpos($_SERVER['HTTP_USER_AGENT'], $bot) !== false)
		$isBot = true;

	if (empty($_SERVER['HTTP_USER_AGENT']) || $_SERVER['HTTP_USER_AGENT'] == " ")
		$isBot = true;
	
	return $isBot;
}

if ($_SERVER['REQUEST_METHOD'] == "POST") {
	$error_msg = NULL;

	if (isBot())
		exit("bots not allowed.</p>");// dumping bot into random generated email page would nice addition

	function clean($data) {
		$data = trim(stripslashes(strip_tags($data)));
		return $data;
	}
	
	// lets check a few things - not enough to trigger an error on their own, but worth assigning a spam score.. 
	// score quickly adds up therefore allowing genuine users with 'accidental' score through but cutting out real spam :)
	$points = (int)0;
	
	$exploits = array("content-type", "bcc:", "cc:", "document.cookie", "onclick", "onload", "javascript");
	
	foreach ($exploits as $exploit)
		if (strpos($_POST['comments'], $exploit) !== false)
			$points += 2;
	
	if (strpos($_POST['comments'], "http://") === true || strpos($_POST['comments'], "www.") === true)
		$points += 2;
	if (isset($_POST['nojs']))
		$points += 1;
	if (preg_match("/(<.*>)/i", $_POST['comments']))
		$points += 2;
	if (strlen($_POST['name']) < 3)
		$points += 1;
	if (strlen($_POST['comments']) < 15 || strlen($_POST['comments'] > 1500))
		$points += 2;
	// end score assignments

	if (empty($_POST['name']) || empty($_POST['email'])) {
		$error_msg .= "Name, e-mail and comments are required fields.";
	} elseif (strlen($_POST['name']) > 35) {
		$error_msg .= "The name field is limited at 35 characters. Your first name or nickname will do!";
	} elseif (!ereg("^[A-Za-z' -]*$", $_POST['name'])) {
		$error_msg .= "The name field must not contain special characters.";
	} elseif (!ereg("^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,6})$",strtolower($_POST['email']))) {
		$error_msg .= "That is not a valid e-mail address.";
	} elseif (!empty($_POST['url']) && !preg_match('/^(http|https):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i', $_POST['url']))
		$error_msg .= "Invalid website url.";
	
	if ($error_msg == NULL && $points <= $maxPoints) {
		$message = "You received this e-mail message through your website:";
		foreach ($_POST as $key => $val) {
			$message .= ucwords($key) . ": $val";
		}
		$message .= 'IP: '.$_SERVER['REMOTE_ADDR']."";
		$message .= 'Browser: '.$_SERVER['HTTP_USER_AGENT']."";
		$message .= 'Points: '.$points;

		if (strstr($_SERVER['SERVER_SOFTWARE'], "Win")) {
			$headers   = "From: $yourEmail";
			$headers  .= "Reply-To: {$_POST['email']}";
		} else {
			$headers   = "From: $yourWebsite <$yourEmail>";
			$headers  .= "Reply-To: {$_POST['email']}";
		}

		if (mail($yourEmail,$subject,$message,$headers)) {
			echo ' <p  style="font-size:36px"align="center">Your mail was successfully sent</p>';
			flood();
		} else {
			echo '<p  style="font-size:36px; color:#FF0000" align="center"> ERROR: Mail NOT Sent </p>';
			flood();
		}
	}
}
function get_data($var) {
	if (isset($_POST[$var]))
		echo htmlspecialchars($_POST[$var]);
}
if ($error_msg != NULL) {
	echo '<p><strong style="color: red;font-size:36px; ">ERROR: spam filter tripped</strong><br />';
	flood();
	echo nl2br($error_msg) . "</p>";
}
?>