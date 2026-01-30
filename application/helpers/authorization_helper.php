<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Authorization helper untuk Data Kontrak dan tombol global
 */

/**
 * Ambil role saat ini
 */
if (!function_exists('get_user_role')) {
    function get_user_role()
    {
        $CI = &get_instance();
        return $CI->session->userdata('user_role');
    }
}

/**
 * apakah guest
 */
if (!function_exists('is_guest')) {
    function is_guest()
    {
        $CI = &get_instance();
        $is_guest = $CI->session->userdata('is_guest');
        $role = strtolower($CI->session->userdata('user_role') ?? '');
        return $is_guest === true || $role === 'guest';
    }
}

/**
 * apakah admin
 */
if (!function_exists('is_admin')) {
    function is_admin()
    {
        $role = strtolower(get_user_role() ?? '');
        return in_array($role, ['admin', 'administrator'], true);
    }
}

/**
 * apakah ASMEN (role_id 15-18 atau role name mengandung 'asmen')
 */
if (!function_exists('is_asmen')) {
    function is_asmen()
    {
        $CI = &get_instance();
        $role_id = $CI->session->userdata('role_id');
        $role = strtolower($CI->session->userdata('user_role') ?? '');
        
        // Check by role_id (15, 16, 17, 18)
        if (in_array($role_id, [15, 16, 17, 18], true)) {
            return true;
        }
        
        // Check by role name containing 'asmen'
        if (strpos($role, 'asmen') !== false) {
            return true;
        }
        
        return false;
    }
}

/**
 * ROLE MAPPING KHUSUS DATA KONTRAK
 */
if (!function_exists('_role_allows_create_kontrak')) {
    function _role_allows_create_kontrak($role)
    {
        $role = strtolower($role ?? '');
        return in_array($role, [
            'admin',
            'administrator',
            'pemeliharaan',
            'fasilitas operasi',
            'har',
            'k3l & kam',
            'perencanaan',
            'kku',
        ], true);
    }
}

if (!function_exists('_role_allows_edit_kontrak')) {
    function _role_allows_edit_kontrak($role)
    {
        $role = strtolower($role ?? '');
        return in_array($role, [
            'admin',
            'administrator',
            'pemeliharaan',
            'fasilitas operasi',
            'har',
            'perencanaan',
            'pengadaan keuangan',
            'kku',
            'k3l & kam',
        ], true);
    }
}

if (!function_exists('_role_allows_delete_kontrak')) {
    function _role_allows_delete_kontrak($role)
    {
        $role = strtolower($role ?? '');
        // Hanya admin/administrator yang boleh hapus
        return in_array($role, ['admin', 'administrator'], true);
    }
}

/**
 * GENERIC can_create / can_edit / can_delete (dipakai banyak view)
 * - tetap mempertahankan logic lama untuk module lain
 */

if (!function_exists('can_create')) {
    function can_create($module = null)
    {
        $CI = &get_instance();
        $role = strtolower($CI->session->userdata('user_role') ?? '');
        $is_guest = $CI->session->userdata('is_guest');

        if ($is_guest || $role === 'guest') {
            return false;
        }

        if ($module === null) {
            $module = strtolower($CI->router->fetch_class());
        } else {
            $module = strtolower($module);
        }
        
        // ASMEN: hanya boleh create di module transport
        if (is_asmen()) {
            $transport_modules = ['transport_request', 'transport_approval', 'transport_fleet', 'transport_security'];
            return in_array($module, $transport_modules, true);
        }

        if ($role === 'pengadaan' || $role === 'kku') {
            return $module === 'transport_fleet';
        }

        // default: allow
        return true;
    }
}

if (!function_exists('can_edit')) {
    function can_edit($module = null)
    {
        $CI = &get_instance();
        $role = strtolower($CI->session->userdata('user_role') ?? '');
        $is_guest = $CI->session->userdata('is_guest');

        if ($is_guest || $role === 'guest') {
            return false;
        }

        if ($module === null) {
            $module = strtolower($CI->router->fetch_class());
        } else {
            $module = strtolower($module);
        }
        
        // ASMEN: hanya boleh edit di module transport
        if (is_asmen()) {
            $transport_modules = ['transport_request', 'transport_approval', 'transport_fleet', 'transport_security'];
            return in_array($module, $transport_modules, true);
        }

        if (is_admin()) return true;

        if ($role === 'pengadaan' || $role === 'kku') {
            return $module === 'transport_fleet';
        }

        return true;
    }
}

if (!function_exists('can_delete')) {
    function can_delete($module = null)
    {
        $CI = &get_instance();
        $role = strtolower($CI->session->userdata('user_role') ?? '');
        $is_guest = $CI->session->userdata('is_guest');

        if ($is_guest || $role === 'guest') {
            return false;
        }

        if ($module === null) {
            $module = strtolower($CI->router->fetch_class());
        } else {
            $module = strtolower($module);
        }
        
        // ASMEN: hanya boleh delete di module transport
        if (is_asmen()) {
            $transport_modules = ['transport_request', 'transport_approval', 'transport_fleet', 'transport_security'];
            return in_array($module, $transport_modules, true);
        }

        if (is_admin()) return true;

        // default deny for others (safer)
        return false;
    }
}

/* ============================================================
   TAMBAHAN KHUSUS MODULE REKOMPOSISI (TANPA MENGUBAH YANG LAMA)
   - Hanya role: Admin/Administrator & Perencanaan
   - Ini opsional, tapi memudahkan jika mau dipanggil eksplisit.
   ============================================================ */

if (!function_exists('can_create_rekomposisi')) {
    function can_create_rekomposisi()
    {
        if (is_guest()) return false;
        $role = strtolower(get_user_role() ?? '');
        return in_array($role, ['admin', 'administrator', 'perencanaan'], true);
    }
}

if (!function_exists('can_edit_rekomposisi')) {
    function can_edit_rekomposisi()
    {
        if (is_guest()) return false;
        $role = strtolower(get_user_role() ?? '');
        return in_array($role, ['admin', 'administrator', 'perencanaan'], true);
    }
}

if (!function_exists('can_delete_rekomposisi')) {
    function can_delete_rekomposisi()
    {
        if (is_guest()) return false;
        $role = strtolower(get_user_role() ?? '');
        return in_array($role, ['admin', 'administrator', 'perencanaan'], true);
    }
}

/**
 * Helper "require" untuk controller (biar rapi).
 * Kalau tidak diizinkan, redirect balik + flash error.
 */
if (!function_exists('require_rekomposisi_create')) {
    function require_rekomposisi_create()
    {
        $CI = &get_instance();
        if (!can_create_rekomposisi()) {
            $CI->session->set_flashdata('error', 'Akses ditolak. Hanya Admin & Perencanaan yang dapat menambah data.');
            redirect('rekomposisi');
            exit;
        }
    }
}

if (!function_exists('require_rekomposisi_edit')) {
    function require_rekomposisi_edit()
    {
        $CI = &get_instance();
        if (!can_edit_rekomposisi()) {
            $CI->session->set_flashdata('error', 'Akses ditolak. Hanya Admin & Perencanaan yang dapat mengubah data.');
            redirect('rekomposisi');
            exit;
        }
    }
}

if (!function_exists('require_rekomposisi_delete')) {
    function require_rekomposisi_delete()
    {
        $CI = &get_instance();
        if (!can_delete_rekomposisi()) {
            $CI->session->set_flashdata('error', 'Akses ditolak. Hanya Admin & Perencanaan yang dapat menghapus data.');
            redirect('rekomposisi');
            exit;
        }
    }
}
