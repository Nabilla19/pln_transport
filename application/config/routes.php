<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'Login';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Auth routes
$route['login'] = 'login/index';
$route['login/authenticate'] = 'login/authenticate';
$route['logout'] = 'login/logout';

// Dashboard route
$route['dashboard'] = 'Dashboard/index';

// E-Transport routes
$route['transport'] = 'Transport_request/index';
$route['transport/ajukan'] = 'Transport_request/create';
$route['transport/simpan'] = 'Transport_request/store';
$route['transport/daftar_saya'] = 'Transport_request/my_requests';
$route['transport/semua_daftar'] = 'Transport_request/all_requests';
$route['transport/detail/(:num)'] = 'Transport_request/detail/$1';
$route['transport/export_pdf'] = 'Transport_request/export_pdf';
$route['transport/export_pdf/(:num)'] = 'Transport_request/export_pdf/$1';

$route['transport/approval'] = 'Transport_approval/index';
$route['transport/approve/(:num)'] = 'Transport_approval/approve/$1';
$route['transport/reject/(:num)'] = 'Transport_approval/reject/$1';
$route['transport/approval/edit/(:num)'] = 'Transport_approval/edit/$1';
$route['transport/approval/update/(:num)'] = 'Transport_approval/update/$1';

$route['transport/fleet'] = 'Transport_fleet/index';
$route['transport/fleet_process/(:num)'] = 'Transport_fleet/process/$1';

$route['transport/security'] = 'Transport_security/index';
$route['transport/security_checkin/(:num)'] = 'Transport_security/checkin/$1';
$route['transport/security_checkout/(:num)'] = 'Transport_security/checkout/$1';

