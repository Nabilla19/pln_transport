<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Log aktivitas user (login, logout, CRUD operations)
 * Helper function yang bisa dipanggil dari mana saja
 * 
 * @param string $jenis_aktivitas login|logout|create|update|delete|import
 * @param string $module Nama module/controller (gardu_induk, sop, dll)
 * @param int $record_id ID record yang di-CRUD
 * @param string $record_name Nama/label record untuk display
 * @return bool
 */
if (!function_exists('log_user_activity')) {
    function log_user_activity($jenis_aktivitas, $module = null, $record_id = null, $record_name = null)
    {
        $CI =& get_instance();
        
        // Pastikan model dimuat
        if (!isset($CI->notifModel)) {
            $CI->load->model('Notifikasi_model', 'notifModel');
        }

        // Get user info dari session
        $user_id = $CI->session->userdata('user_id');
        $email = $CI->session->userdata('email');
        $role = $CI->session->userdata('role');

        // Jika session tidak ada, skip
        if (!$user_id || !$email || !$role) {
            return false;
        }

        // Get IP address dan user agent
        $ip_address = $CI->input->ip_address();
        $user_agent = $CI->input->user_agent();

        // Log ke database
        return $CI->notifModel->log_aktivitas(
            $user_id,
            $email,
            $role,
            $jenis_aktivitas,
            $module,
            $record_id,
            $record_name,
            $ip_address,
            $user_agent
        );
    }
}

/**
 * Log aktivitas login
 */
if (!function_exists('log_login')) {
    function log_login()
    {
        return log_user_activity('login');
    }
}

/**
 * Log aktivitas logout
 */
if (!function_exists('log_logout')) {
    function log_logout()
    {
        return log_user_activity('logout');
    }
}

/**
 * Log create operation
 * @param string $module Nama module (gardu_induk, sop, dll)
 * @param int $record_id ID record yang dibuat
 * @param string $record_name Nama/label record
 */
if (!function_exists('log_create')) {
    function log_create($module, $record_id, $record_name)
    {
        return log_user_activity('create', $module, $record_id, $record_name);
    }
}

/**
 * Log update operation
 * @param string $module Nama module
 * @param int $record_id ID record yang diupdate
 * @param string $record_name Nama/label record
 */
if (!function_exists('log_update')) {
    function log_update($module, $record_id, $record_name)
    {
        return log_user_activity('update', $module, $record_id, $record_name);
    }
}

/**
 * Log delete operation
 * @param string $module Nama module
 * @param int $record_id ID record yang dihapus
 * @param string $record_name Nama/label record
 */
if (!function_exists('log_delete')) {
    function log_delete($module, $record_id, $record_name)
    {
        return log_user_activity('delete', $module, $record_id, $record_name);
    }
}

/**
 * Log import operation
 * @param string $module Nama module
 * @param string $record_name Info import (jumlah data, dll)
 */
if (!function_exists('log_import')) {
    function log_import($module, $record_name)
    {
        return log_user_activity('import', $module, null, $record_name);
    }
}


