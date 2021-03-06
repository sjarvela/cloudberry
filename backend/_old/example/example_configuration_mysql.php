<?php
	
	/* For configuration instructions, see https://github.com/sjarvela/cloudberry/wiki/Installation-instructions */

	$CONFIGURATION = array(
		"db" => array(
			"type" => "mysql",
			"database" => "cloudberry",
			"user" => "cloudberry",
			"password" => "cloudberry",
			"charset" => "utf8"
		),
		"timezone" => "Europe/Helsinki",	// change this to match your timezone
		
		"plugins" => array(
			"FileViewerEditor" => array(
				"viewers" => array(
					"Image" => array("gif", "png", "jpg")
				),
				"previewers" => array(
					"Image" => array("gif", "png", "jpg")
				)
			),
			"ItemDetails" => array()
		)
	);
?>