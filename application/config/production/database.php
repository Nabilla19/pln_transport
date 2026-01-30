<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------
| DATABASE CONNECTIVITY SETTINGS (PRODUCTION ENVIRONMENT)
| -------------------------------------------------------------------
| This file is loaded automatically when ENVIRONMENT is set to 'production'
| in index.php or via server variable.
| 
| IMPORTANT: Replace the placeholders below with the actual credentials
| from your InfinityFree panel.
*/

$active_group = 'default';
$query_builder = TRUE;

$db['default'] = array(
	'dsn'	=> '',
	'hostname' => 'sql100.infinityfree.com', 
	'username' => 'if0_40964294',           
	'password' => 'Nabillany19', 
	'database' => 'if0_40964294_db_pln_up2d',   
	'dbdriver' => 'mysqli',
	'dbprefix' => '',
	'pconnect' => FALSE,
	'db_debug' => FALSE, // HIDE ERRORS ON PRODUCTION
	'cache_on' => FALSE,
	'cachedir' => '',
	'char_set' => 'utf8',
	'dbcollat' => 'utf8_general_ci',
	'swap_pre' => '',
	'encrypt' => FALSE,
	'compress' => FALSE,
	'stricton' => FALSE,
	'failover' => array(),
	'save_queries' => FALSE // Disable for performance
);
